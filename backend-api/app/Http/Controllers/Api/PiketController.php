<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PiketSchedule;
use App\Models\SiswaProfile;
use App\Models\User;
use App\Models\DispensasiTicket;
use App\Services\ExpoPushService;

class PiketController extends Controller
{
    public function getStatus(Request $request)
    {
        $user = $request->user();

        $now = now();
        $hariIni = $now->dayOfWeekIso; // 1 (Senin) - 7 (Minggu)
        $jamIni = $now->format('H:i:s');

        $aktif = PiketSchedule::where('guru_id', $user->id)
            ->where('hari', $hariIni)
            ->where('jam_mulai', '<=', $jamIni)
            ->where('jam_selesai', '>=', $jamIni)
            ->exists();

        return response()->json(['is_ready' => $aktif]);
    }


    public function getQueue(Request $request)
    {
        $now = now();
        $guruId = $request->user()->id;

        // 1. Cek apakah Guru ini sedang masuk jadwal Shift
        $isScheduledNow = PiketSchedule::where('guru_id', $guruId)
            ->where('hari', $now->dayOfWeekIso)
            ->where('jam_mulai', '<=', $now->format('H:i:s'))
            ->where('jam_selesai', '>=', $now->format('H:i:s'))
            ->exists();

        // Jika di luar jadwal, kembalikan status false agar UI menyesuaikan
        if (!$isScheduledNow) {
            return response()->json([
                'is_active_shift' => false,
                'data' => [],
                'message' => 'Saat ini Anda sedang tidak dalam jadwal piket.'
            ]);
        }

        // 2. Tarik semua tiket dari Pool (FIFO - First In First Out)
        $queue = DispensasiTicket::with(['siswa', 'kelas'])
            ->where('status', 'waiting_piket')
            ->whereNull('guru_piket_id')
            ->orderBy('created_at', 'asc') // Yang paling lama menunggu ada di atas
            ->get();

        return response()->json([
            'is_active_shift' => true,
            'data' => $queue
        ]);
    }


    public function validateQR(Request $request) {
        $request->validate(['qr_token' => 'required|uuid']);

        $ticket = \App\Models\DispensasiTicket::where('qr_token', $request->qr_token)->first();

        if (!$ticket) {
            return response()->json(['valid' => false, 'message' => 'QR Code Palsu / Tidak Dikenali'], 404);
        }

        if ($ticket->isExpired()) {
            return response()->json([
                'valid' => false,
                'message' => 'Akses Ditolak: Tiket ini sudah KEDALUWARSA!'
            ], 400);
        }

        if ($ticket->scanned_at !== null) {
            return response()->json(['valid' => false, 'message' => 'QR Code ini sudah pernah dipakai!'], 400);
        }

        // Jika Valid, kunci tiket
        $ticket->update([
            'status' => 'completed_exit',
            'is_scanned' => true,
            'scanned_at' => now(),
            'scanner_id' => $request->user()->id
        ]);

        $ticket->load('siswa'); // Load relasi siswa untuk nama

        // Notifikasi ke Siswa
        if ($ticket->siswa) {
            ExpoPushService::send(
                $ticket->siswa->device_token ?? [],
                '🚪 QR Tervalidasi',
                "Izin Anda telah divalidasi di gerbang.",
                ['ticket_id' => $ticket->id, 'type' => 'qr_validated'],
                [$ticket->siswa->id]
            );
        }

        // Notifikasi ke Orang Tua
        $profil = SiswaProfile::where('user_id', $ticket->siswa_id)->first();
        if ($profil && $profil->orang_tua_id) {
            $ortu = User::find($profil->orang_tua_id);
            if ($ortu) {
                $namaAnak = $ticket->siswa->name ?? 'Anak Anda';
                ExpoPushService::send(
                    $ortu->device_token ?? [],
                    '🚪 Anak Keluar Sekolah',
                    "{$namaAnak} baru saja tervalidasi keluar gerbang.",
                    ['ticket_id' => $ticket->id, 'type' => 'qr_validated'],
                    [$ortu->id]
                );
            }
        }

        return response()->json(['valid' => true, 'message' => 'Izin Sah. Siswa divalidasi untuk keluar.', 'data' => $ticket]);
    }




    public function getDailyLog(Request $request)
    {
        $startOfDay = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        $logs = \App\Models\DispensasiTicket::with(['siswa', 'scanner'])
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereIn('status', ['approved_final', 'completed_exit'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'date' => now()->format('Y-m-d'),
            'total' => $logs->count(),
            'scanned_count' => $logs->where('is_scanned', true)->count(),
            'data' => $logs
        ]);
    }
}
