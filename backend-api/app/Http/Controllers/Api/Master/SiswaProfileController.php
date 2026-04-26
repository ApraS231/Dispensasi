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
            'user_id' => 'required|exists:users,id|unique:siswa_profiles',
            'nis' => 'required|string|unique:siswa_profiles',
            'kelas_id' => 'required|exists:kelas,id',
            'orang_tua_id' => 'nullable|exists:users,id',
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
            'user_id' => 'sometimes|exists:users,id|unique:siswa_profiles,user_id,' . $id,
            'nis' => 'sometimes|string|unique:siswa_profiles,nis,' . $id,
            'kelas_id' => 'sometimes|exists:kelas,id',
            'orang_tua_id' => 'nullable|exists:users,id',
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
