<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\SiswaProfile;
use Illuminate\Http\Request;

class SiswaProfileController extends Controller
{
    public function index()
    {
        return response()->json(SiswaProfile::with(['user', 'kelas', 'orangTua'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_pengguna' => 'required|exists:pengguna,id_pengguna|unique:profil_siswa,id_pengguna',
            'nis' => 'required|string|unique:profil_siswa,nis',
            'id_kelas' => 'required|exists:kelas,id_kelas',
            'id_orang_tua' => 'nullable|exists:pengguna,id_pengguna',
        ]);
        $profile = SiswaProfile::create($validated);
        return response()->json($profile, 201);
    }

    public function show($id)
    {
        return response()->json(SiswaProfile::with(['user', 'kelas', 'orangTua'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $profile = SiswaProfile::findOrFail($id);
        $validated = $request->validate([
            'id_pengguna' => 'sometimes|exists:pengguna,id_pengguna|unique:profil_siswa,id_pengguna,' . $id . ',id_profil_siswa',
            'nis' => 'sometimes|string|unique:profil_siswa,nis,' . $id . ',id_profil_siswa',
            'id_kelas' => 'sometimes|exists:kelas,id_kelas',
            'id_orang_tua' => 'nullable|exists:pengguna,id_pengguna',
        ]);
        $profile->update($validated);
        return response()->json($profile);
    }

    public function destroy($id)
    {
        SiswaProfile::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}
