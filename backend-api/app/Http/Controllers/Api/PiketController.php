<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PiketSchedule;

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

        return response()->json(['valid' => true, 'message' => 'Izin Sah. Siswa divalidasi untuk keluar.', 'data' => $ticket]);
    }

}
