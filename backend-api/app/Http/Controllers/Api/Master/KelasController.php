<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index()
    {
        return response()->json(Kelas::with('waliKelas')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kelas' => 'required|string',
            'tingkat' => 'required|string',
            'wali_kelas_id' => 'nullable|exists:users,id',
        ]);
        $kelas = Kelas::create($validated);
        return response()->json($kelas, 201);
    }

    public function show($id)
    {
        return response()->json(Kelas::with('waliKelas')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);
        $validated = $request->validate([
            'nama_kelas' => 'sometimes|string',
            'tingkat' => 'sometimes|string',
            'wali_kelas_id' => 'nullable|exists:users,id',
        ]);
        $kelas->update($validated);
        return response()->json($kelas);
    }

    public function destroy($id)
    {
        Kelas::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}
