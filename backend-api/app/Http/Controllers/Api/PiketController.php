<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PiketAttendanceLog;

class PiketController extends Controller
{
    public function setReady(Request $request)
    {
        $user = $request->user();

        PiketAttendanceLog::where('guru_id', $user->id)
            ->where('status_aktif', true)
            ->update(['status_aktif' => false, 'waktu_keluar' => now()]);

        $log = PiketAttendanceLog::create([
            'guru_id' => $user->id,
            'waktu_masuk' => now(),
            'status_aktif' => true
        ]);

        return response()->json(['message' => 'Anda sekarang bertugas (Ready).', 'data' => $log]);
    }

    public function setCheckout(Request $request)
    {
        $user = $request->user();

        PiketAttendanceLog::where('guru_id', $user->id)
            ->where('status_aktif', true)
            ->update(['status_aktif' => false, 'waktu_keluar' => now()]);

        return response()->json(['message' => 'Anda telah menyelesaikan tugas (Checkout).']);
    }

    public function getStatus(Request $request)
    {
        $user = $request->user();
        $aktif = PiketAttendanceLog::where('guru_id', $user->id)
            ->where('status_aktif', true)
            ->exists();
        
        return response()->json(['is_ready' => $aktif]);
    }
}
