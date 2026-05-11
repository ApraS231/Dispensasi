<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DispensasiTicket;
use App\Models\PiketSchedule;
use App\Models\PiketAttendanceLog;
use App\Models\SiswaProfile;
use App\Models\User;
use App\Services\ExpoPushService;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DispensasiController extends Controller
{
    public function show($id)
    {
        $ticket = DispensasiTicket::with(['siswa', 'kelas', 'waliKelas', 'guruPiket'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info("Request Pengajuan Izin:", $request->all());
        \Illuminate\Support\Facades\Log::info("Files in Request:", $request->allFiles());

        $user = $request->user();
        
        $request->validate([
            'jenis_izin' => 'required|in:sakit,izin,dispensasi',
            'alasan' => 'required|string',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'required|date',
            'foto_bukti' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // Maks 5MB
            'siswa_id' => ($user->role === 'orang_tua' ? 'required|exists:users,id' : 'nullable'),
        ]);

        $siswaId = $user->id;
        if ($user->role === 'orang_tua') {
            $siswaId = $request->siswa_id;
            // Verifikasi apakah siswa_id adalah anak dari orang tua ini
            $isAnak = SiswaProfile::where('orang_tua_id', $user->id)
                ->where('user_id', $siswaId)
                ->exists();
            
            if (!$isAnak) {
                return response()->json(['message' => 'Anda tidak memiliki otoritas untuk mengajukan izin bagi siswa ini.'], 403);
            }
        }

        $profilSiswa = SiswaProfile::where('user_id', $siswaId)->with('kelas')->first();

        if (!$profilSiswa) {
            return response()->json(['message' => 'Profil siswa tidak ditemukan'], 400);
        }

        // Prevent multiple tickets within 12 hours
        $lastTicket = DispensasiTicket::where('siswa_id', $siswaId)
            ->latest()
            ->first();

        if ($lastTicket) {
            $isRejected = $lastTicket->status === 'rejected';
            $isExpired = $lastTicket->expires_at && now()->greaterThan($lastTicket->expires_at);
            $isWithin12Hours = $lastTicket->created_at->diffInHours(now()) < 12;

            if ($isWithin12Hours && !$isRejected && !$isExpired) {
                $sisaJam = 12 - $lastTicket->created_at->diffInHours(now());
                return response()->json([
                    'message' => "Anda hanya dapat mengajukan 1 dispensasi setiap 12 jam. Silakan coba lagi dalam {$sisaJam} jam."
                ], 400);
            }
        }

        $waliKelasId = $profilSiswa->kelas->wali_kelas_id ?? null;

        // 1. Proses Upload Gambar jika ada
        $lampiranUrl = null;
        if ($request->hasFile('foto_bukti')) {
            try {
                $file = $request->file('foto_bukti');
                // Buat nama file acak berbasis UUID agar aman
                $fileName = (string) Str::uuid() . '.' . $file->getClientOriginalExtension();
                
                // Simpan ke Supabase Storage di dalam folder 'bukti_izin'
                $path = $file->storeAs('bukti_izin', $fileName, 'supabase');
                
                if ($path) {
                    // Dapatkan URL publik penuh untuk disimpan di Database
                    $lampiranUrl = \Illuminate\Support\Facades\Storage::disk('supabase')->url($path);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal upload ke Supabase: " . $e->getMessage());
                // Lanjutkan tanpa gambar jika upload gagal, atau bisa kembalikan error
                // return response()->json(['message' => 'Gagal mengunggah foto bukti: ' . $e->getMessage()], 500);
            }
        }

        $tiket = DispensasiTicket::create([
            'siswa_id' => $siswaId,
            'kelas_id' => $profilSiswa->kelas_id,
            'wali_kelas_id' => $waliKelasId,
            'jenis_izin' => $request->jenis_izin,
            'alasan' => $request->alasan,
            'lampiran_bukti' => $lampiranUrl,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_selesai' => $request->waktu_selesai,
            'status' => 'pending'
        ]);

        $siswaName = $profilSiswa->user->name ?? 'Siswa';

        // Notifikasi ke Wali Kelas
        if ($waliKelasId) {
            $waliKelas = User::find($waliKelasId);
            if ($waliKelas) {
                ExpoPushService::send(
                    $waliKelas->device_token ?? [],
                    '📝 Izin Baru Kelas Anda',
                    "{$siswaName} mengajukan izin: {$request->jenis_izin}.",
                    ['ticket_id' => $tiket->id, 'type' => 'new_ticket'],
                    [$waliKelasId]
                );
            }
        }

        // Notifikasi ke Orang Tua
        if ($profilSiswa->orang_tua_id) {
            $ortuId = $profilSiswa->orang_tua_id;
            $ortu = User::find($ortuId);
            if ($ortu) {
                ExpoPushService::send(
                    $ortu->device_token ?? [],
                    'ℹ️ Info Kehadiran',
                    "Anak Anda, {$siswaName}, baru saja mengajukan izin.",
                    ['ticket_id' => $tiket->id, 'type' => 'new_ticket'],
                    [$ortuId]
                );
            }
        }

        return response()->json(['message' => 'Tiket berhasil diajukan', 'data' => $tiket], 201);
    }

    public function approve(Request $request, $id)
    {
        try {
            $tiket = DispensasiTicket::with(['siswa', 'waliKelas', 'guruPiket'])->findOrFail($id);
            $user = $request->user();

            \Illuminate\Support\Facades\Log::info("User {$user->id} ({$user->role}) attempting to approve ticket {$id}");

            if ($user->role === 'wali_kelas' && $tiket->wali_kelas_id === $user->id) {

                // 1. Lempar tiket ke "Meja Piket" (Pool)
                $tiket->update([
                    'status' => 'waiting_piket',
                    'guru_piket_id' => null // Biarkan kosong/mengambang
                ]);

                // 2. Cari Guru Piket yang sedang aktif DETIK INI untuk dikirimi Push Notif
                $now = now();
                $hariIni = $now->dayOfWeekIso; // 1 (Senin) - 7 (Minggu)
                $jamIni = $now->format('H:i:s');

                $activeSchedules = PiketSchedule::where('hari', $hariIni)
                    ->where('jam_mulai', '<=', $jamIni)
                    ->where('jam_selesai', '>=', $jamIni)
                    ->with('guru')
                    ->get()
                    ->unique('guru_id'); // Pastikan satu guru hanya dapat 1 notif meskipun punya jadwal overlap

                foreach ($activeSchedules as $schedule) {
                    if ($schedule->guru && $schedule->guru->device_token) {
                        ExpoPushService::send(
                            $schedule->guru->device_token,
                            '⏳ Antrean Baru di Meja Piket',
                            "Tiket izin {$tiket->siswa->name} telah disetujui Wali Kelas dan menunggu validasi Anda.",
                            ['ticket_id' => $tiket->id, 'type' => 'ticket_forwarded'],
                            [$schedule->guru->id]
                        );
                    }
                }

                // Notify Siswa (Wali Approve)
                if ($tiket->siswa && $tiket->siswa->device_token) {
                    ExpoPushService::send(
                        $tiket->siswa->device_token,
                        '📋 Update Status Izin',
                        "Izin Anda disetujui Wali Kelas, menunggu validasi Guru Piket.",
                        ['ticket_id' => $tiket->id, 'type' => 'ticket_approved'],
                        [$tiket->siswa->id]
                    );
                }

                return response()->json(['message' => 'Tiket disetujui Wali Kelas. Diteruskan ke Antrean Piket.', 'data' => $tiket]);

            } else if ($user->role === 'guru_piket') {
                // Shift Check: Guru Piket must be on duty to approve
                if (!$this->isGuruPiketOnShift($user->id)) {
                    return response()->json(['message' => 'Anda sedang tidak dalam jadwal piket aktif.'], 403);
                }

                // Pool Claim: Pastikan tiket masih available di pool atau belum diklaim orang lain
                if ($tiket->status !== 'waiting_piket' || $tiket->guru_piket_id !== null) {
                    return response()->json([
                        'message' => 'Tiket ini sudah diproses oleh Guru Piket lain atau statusnya sudah berubah.'
                    ], 409); // 409 Conflict
                }

                $tiket->update([
                    'status' => 'approved_final',
                    'guru_piket_id' => $user->id, // KLAIM & KUNCI KE GURU INI
                    'qr_token' => (string) Str::uuid(),
                    'expires_at' => now()->addHours(12)
                ]);

                // Notify Siswa (Final Approve)
                if ($tiket->siswa && $tiket->siswa->device_token) {
                    ExpoPushService::send(
                        $tiket->siswa->device_token,
                        '✅ Izin Disetujui!',
                        "QR Code terbit. Silakan menuju meja piket.",
                        ['ticket_id' => $tiket->id, 'type' => 'ticket_approved'],
                        [$tiket->siswa->id]
                    );
                }

                // Notify Orang Tua (Final Approve)
                $profil = SiswaProfile::where('user_id', $tiket->siswa_id)->first();
                if ($profil && $profil->orang_tua_id) {
                    $ortu = User::find($profil->orang_tua_id);
                    if ($ortu && $ortu->device_token) {
                        ExpoPushService::send(
                            $ortu->device_token,
                            '✅ Izin Diverifikasi',
                            "Izin sekolah {$tiket->siswa->name} telah diverifikasi oleh sekolah.",
                            ['ticket_id' => $tiket->id, 'type' => 'ticket_approved'],
                            [$ortu->id]
                        );
                    }
                }

                return response()->json(['message' => 'Tiket disetujui Guru Piket', 'data' => $tiket]);
            } else {
                return response()->json(['message' => 'Anda tidak memiliki hak akses untuk menyetujui tiket ini.'], 403);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Approval error: " . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }
    
    public function reject(Request $request, $id)
    {
        $tiket = DispensasiTicket::findOrFail($id);
        $user = $request->user();

        $request->validate(['catatan_penolakan' => 'required|string']);

        if ($user->role === 'admin') {
            $canReject = true;
        } else if ($user->role === 'wali_kelas' && $tiket->wali_kelas_id === $user->id) {
            $canReject = true;
        } else if ($user->role === 'guru_piket') {
            // Shift Check
            if (!$this->isGuruPiketOnShift($user->id)) {
                return response()->json(['message' => 'Anda sedang tidak dalam jadwal piket aktif.'], 403);
            }

            // Guru piket only can reject if it's already in their pool/claimed
            $canReject = ($tiket->guru_piket_id === $user->id || ($tiket->status === 'waiting_piket' && $tiket->guru_piket_id === null));
        } else {
            $canReject = false;
        }

        if ($canReject) {
            $tiket->update([
                'status' => 'rejected',
                'catatan_penolakan' => $request->catatan_penolakan
            ]);

            // Notify Siswa
            if ($tiket->siswa) {
                ExpoPushService::send(
                    $tiket->siswa->device_token ?? [],
                    '❌ Izin Ditolak',
                    "Maaf, izin Anda ditolak. Ketuk untuk detail.",
                    ['ticket_id' => $tiket->id, 'type' => 'ticket_rejected'],
                    [$tiket->siswa->id]
                );
            }

            // Notify Orang Tua
            $profil = SiswaProfile::where('user_id', $tiket->siswa_id)->first();
            if ($profil && $profil->orang_tua_id) {
                $ortu = User::find($profil->orang_tua_id);
                if ($ortu) {
                    ExpoPushService::send(
                        $ortu->device_token ?? [],
                        '❌ Izin Anak Ditolak',
                        "Izin anak Anda, {$tiket->siswa->name}, ditolak oleh sekolah.",
                        ['ticket_id' => $tiket->id, 'type' => 'ticket_rejected'],
                        [$ortu->id]
                    );
                }
            }
        } else {
            return response()->json(['message' => 'Anda tidak berhak menolak tiket ini'], 403);
        }

        return response()->json(['message' => 'Tiket ditolak', 'data' => $tiket]);
    }

    public function myTickets(Request $request)
    {
        $query = DispensasiTicket::where('siswa_id', $request->user()->id)->latest();
        
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json($query->paginate($request->per_page ?? 10));
    }
    
    public function monitoringAnak(Request $request)
    {
        $user = $request->user();
        $anakIds = SiswaProfile::where('orang_tua_id', $user->id)->pluck('user_id');
        
        $query = DispensasiTicket::whereIn('siswa_id', $anakIds)
            ->with(['siswa.siswaProfile.kelas'])
            ->latest();

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json($query->paginate($request->per_page ?? 10));
    }

    public function getChildren(Request $request)
    {
        $user = $request->user();
        $children = SiswaProfile::where('orang_tua_id', $user->id)
            ->with(['user', 'kelas'])
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->user_id,
                    'name' => $profile->user->name,
                    'nis' => $profile->nis,
                    'kelas' => $profile->kelas->nama_kelas ?? '-',
                ];
            });
        return response()->json($children);
    }

    public function pending(Request $request)
    {
        $user = $request->user();
        $query = DispensasiTicket::with('siswa')->latest();

        if ($user->role === 'wali_kelas') {
            $query->where('wali_kelas_id', $user->id)->where('status', 'pending');
        } else if ($user->role === 'guru_piket') {
            // Shift Check: If not on shift, don't show queue
            if (!$this->isGuruPiketOnShift($user->id)) {
                return response()->json([], 200);
            }

            // Pool: Tampilkan semua tiket yang sedang menunggu piket (baik yang belum diklaim maupun yang miliknya)
            $query->where('status', 'waiting_piket');
        } else {
            return response()->json([], 200);
        }

        return response()->json($query->get());
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = DispensasiTicket::with('siswa')->latest();

        if ($user->role === 'wali_kelas') {
            $query->where('wali_kelas_id', $user->id);
        } else if ($user->role === 'guru_piket') {
            // Shift Check: If not on shift, don't show history
            if (!$this->isGuruPiketOnShift($user->id)) {
                return response()->json([], 200);
            }

            $query->where(function($q) use ($user) {
                $q->where('guru_piket_id', $user->id)
                  ->orWhere('status', 'waiting_piket');
            });
        } else {
            return response()->json([], 200);
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json($query->paginate($request->per_page ?? 10));
    }

    private function isGuruPiketOnShift($guruId)
    {
        $now = now();
        return PiketSchedule::where('guru_id', $guruId)
            ->where('hari', $now->dayOfWeekIso)
            ->where('jam_mulai', '<=', $now->format('H:i:s'))
            ->where('jam_selesai', '>=', $now->format('H:i:s'))
            ->exists();
    }
}
