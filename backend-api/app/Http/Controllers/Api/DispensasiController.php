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
        $request->validate([
            'jenis_izin' => 'required|in:sakit,keperluan_keluarga,lainnya',
            'alasan' => 'required|string',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'required|date',
        ]);

        $siswa = $request->user();
        $profilSiswa = SiswaProfile::where('user_id', $siswa->id)->with('kelas')->first();

        if (!$profilSiswa) {
            return response()->json(['message' => 'Profil siswa tidak ditemukan'], 400);
        }

        // Prevent multiple tickets within 12 hours, unless previous ticket has expired or been rejected
        $lastTicket = DispensasiTicket::where('siswa_id', $siswa->id)
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

        $tiket = DispensasiTicket::create([
            'siswa_id' => $siswa->id,
            'kelas_id' => $profilSiswa->kelas_id,
            'wali_kelas_id' => $waliKelasId,
            'jenis_izin' => $request->jenis_izin,
            'alasan' => $request->alasan,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_selesai' => $request->waktu_selesai,
            'status' => 'pending'
        ]);

        // Notifikasi ke Wali Kelas
        if ($waliKelasId) {
            $waliKelas = User::find($waliKelasId);
            if ($waliKelas) {
                ExpoPushService::send(
                    $waliKelas->device_token ?? [],
                    '📝 Izin Baru Kelas Anda',
                    "{$siswa->name} mengajukan izin: {$request->jenis_izin}.",
                    ['ticket_id' => $tiket->id, 'type' => 'new_ticket'],
                    [$waliKelasId]
                );
            }
        }

        // Notifikasi ke Orang Tua
        if ($profilSiswa->orang_tua_id) {
            $ortu = User::find($profilSiswa->orang_tua_id);
            if ($ortu) {
                ExpoPushService::send(
                    $ortu->device_token ?? [],
                    'ℹ️ Info Kehadiran',
                    "Anak Anda, {$siswa->name}, baru saja mengajukan izin.",
                    ['ticket_id' => $tiket->id, 'type' => 'new_ticket'],
                    [$profilSiswa->orang_tua_id]
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

                // Logika Auto-Assignment Guru Piket
                $now = now();
                $hariIni = $now->dayOfWeekIso; // 1 (Senin) - 7 (Minggu)
                $jamIni = $now->format('H:i:s');

                $activeSchedule = PiketSchedule::where('hari', $hariIni)
                    ->where('jam_mulai', '<=', $jamIni)
                    ->where('jam_selesai', '>=', $jamIni)
                    ->first();

                if (!$activeSchedule) {
                    return response()->json(['message' => 'Persetujuan gagal: Tidak ada Guru Piket yang bertugas (jadwal piket) saat ini.'], 422);
                }

                $tiket->update([
                    'status' => 'waiting_piket',
                    'guru_piket_id' => $activeSchedule->guru_id
                ]);

                // Notify Guru Piket
                $guruPiket = User::find($activeSchedule->guru_id);
                if ($guruPiket && $guruPiket->device_token) {
                    ExpoPushService::send(
                        $guruPiket->device_token,
                        '⏳ Butuh Persetujuan Final',
                        "Ada tiket dispensasi baru yang perlu persetujuan Anda.",
                        ['ticket_id' => $tiket->id, 'type' => 'ticket_forwarded'],
                        [$guruPiket->id]
                    );
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

                return response()->json(['message' => 'Tiket disetujui Wali Kelas', 'data' => $tiket]);

            } else if ($user->role === 'guru_piket' && $tiket->guru_piket_id === $user->id) {
                $tiket->update([
                    'status' => 'approved_final',
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

        if (($user->role === 'wali_kelas' && $tiket->wali_kelas_id === $user->id) || 
            ($user->role === 'guru_piket' && $tiket->guru_piket_id === $user->id)) {
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
        $tickets = DispensasiTicket::where('siswa_id', $request->user()->id)->latest()->get();
        return response()->json($tickets);
    }
    
    public function monitoringAnak(Request $request)
    {
        $user = $request->user();
        
        $anakIds = SiswaProfile::where('orang_tua_id', $user->id)->pluck('user_id');
        $tickets = DispensasiTicket::whereIn('siswa_id', $anakIds)->with(['siswa.profile.kelas'])->latest()->get();
        return response()->json($tickets);
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
            $query->where('guru_piket_id', $user->id)->where('status', 'waiting_piket');
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
            $query->where('guru_piket_id', $user->id);
        } else {
            return response()->json([], 200);
        }

        return response()->json($query->get());
    }
}
