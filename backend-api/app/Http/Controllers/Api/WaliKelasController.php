<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SiswaProfile;

class WaliKelasController extends Controller
{
    public function getSiswaKelas(Request $request)
    {
        $user = $request->user();
        
        // Cari kelas yang diampu oleh wali kelas ini
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->first();

        if (!$kelas) {
            return response()->json([
                'message' => 'Anda tidak terdaftar sebagai Wali Kelas.',
                'user_id' => $user->id,
                'role' => $user->role
            ], 404);
        }

        $siswa = SiswaProfile::where('kelas_id', $kelas->id)
            ->with(['user', 'orangTua'])
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->user_id,
                    'name' => $profile->user->name ?? 'Unknown User',
                    'nis' => $profile->nis,
                    'has_parent' => $profile->orang_tua_id ? true : false,
                    'parent_name' => $profile->orangTua->name ?? null,
                ];
            });

        return response()->json([
            'kelas' => $kelas->nama_kelas,
            'siswa' => $siswa,
        ]);
    }
}
