<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PiketSchedule;
use App\Models\SiswaProfile;
use App\Models\User;
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
            ->where('hari_dalam_minggu', $hariIni)
            ->where('jam_mulai', '<=', $jamIni)
            ->where('jam_selesai', '>=', $jamIni)
            ->where('is_active', true)
            ->exists();

        return response()->json(['is_ready' => $aktif]);
    }


    public function validateQR(Request $request) {
        $request->validate(['qr_token' => 'required|uuid']);

        $ticket = \App\Models\DispensasiTicket::where('qr_token', $request->qr_token)->first();

        if (!$ticket) {
            return response()->json(['valid' => false, 'message' => 'QR Code Palsu / Tidak Dikenali'], 404);
        }

        if ($ticket->scanned_at !== null) {
            return response()->json(['valid' => false, 'message' => 'QR Code ini sudah pernah dipakai!'], 400);
        }

        // Jika Valid, kunci tiket
        $ticket->update([
            'status' => 'completed_exit',
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

}
