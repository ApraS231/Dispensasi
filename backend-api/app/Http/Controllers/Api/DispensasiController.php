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

        // Dapatkan Device Token dari Wali Kelas
        if ($waliKelasId) {
            $guruTokens = User::where('id', $waliKelasId)
                            ->whereNotNull('device_token')
                            ->pluck('device_token')
                            ->toArray();

            if (!empty($guruTokens)) {
                ExpoPushService::send(
                    $guruTokens,
                    '⏳ Pengajuan Dispensasi Baru',
                    "{$siswa->name} mengajukan izin: {$request->jenis_izin}.",
                    ['ticket_id' => $tiket->id, 'type' => 'new_ticket']
                );
            }
        }

        return response()->json(['message' => 'Tiket berhasil diajukan', 'data' => $tiket], 201);
    }

    public function approve(Request $request, $id)
    {
        $tiket = DispensasiTicket::findOrFail($id);
        $user = $request->user();

        if ($user->role === 'wali_kelas' && $tiket->wali_kelas_id === $user->id) {

            // Logika Auto-Assignment Guru Piket
            $now = now();
            $hariIni = $now->dayOfWeekIso; // 1 (Senin) - 7 (Minggu)
            $jamIni = $now->format('H:i:s');

            $activeSchedule = PiketSchedule::where('hari_dalam_minggu', $hariIni)
                ->where('jam_mulai', '<=', $jamIni)
                ->where('jam_selesai', '>=', $jamIni)
                ->where('is_active', true)
                ->first();

            if (!$activeSchedule) {
                return response()->json(['message' => 'Tidak ada Guru Piket yang bertugas saat ini.'], 404);
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
                    '⏳ Tiket Dispensasi Baru Diteruskan',
                    "Ada tiket dispensasi baru yang perlu persetujuan Anda.",
                    ['ticket_id' => $tiket->id, 'type' => 'ticket_forwarded']
                );
            }


        } else if ($user->role === 'guru_piket' && $tiket->guru_piket_id === $user->id) {
            $tiket->update([
                'status' => 'approved_final',
                'qr_token' => (string) Str::uuid()
            ]);
        } else {
            return response()->json(['message' => 'Anda tidak berhak menyetujui tiket ini'], 403);
        }

        // Kirim notifikasi ke Siswa
        if ($tiket->siswa && $tiket->siswa->device_token) {
            ExpoPushService::send(
                $tiket->siswa->device_token,
                '✅ Izin Disetujui!',
                'Izin Anda telah disetujui. Cek status selengkapnya.',
                ['ticket_id' => $tiket->id, 'type' => 'ticket_approved']
            );
        }

        // Kirim notifikasi ke Orang Tua
        $profil = SiswaProfile::where('user_id', $tiket->siswa_id)->first();
        if ($profil && $profil->orang_tua_id) {
            $ortu = User::find($profil->orang_tua_id);
            if ($ortu && $ortu->device_token) {
                ExpoPushService::send(
                    $ortu->device_token,
                    '✅ Izin Anak Anda Disetujui',
                    "Izin sekolah {$tiket->siswa->name} telah diverifikasi oleh sekolah.",
                    ['ticket_id' => $tiket->id, 'type' => 'ticket_approved']
                );
            }
        }

        return response()->json(['message' => 'Tiket disetujui', 'data' => $tiket]);
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
        if ($user->role !== 'orang_tua') return response()->json(['message' => 'Forbidden'], 403);
        
        $anakIds = SiswaProfile::where('orang_tua_id', $user->id)->pluck('user_id');
        $tickets = DispensasiTicket::whereIn('siswa_id', $anakIds)->with('siswa')->latest()->get();
        return response()->json($tickets);
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
