<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClassJoinRequest;
use App\Models\SiswaProfile;
use Illuminate\Support\Facades\DB;

class WaliKelasController extends Controller
{
    public function getClassRequests(Request $request)
    {
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->firstOrFail();

        $requests = ClassJoinRequest::where('kelas_id', $kelas->id)
            ->where('status', 'pending')
            ->with('siswa')
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function respondClassRequest(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:accepted,rejected']);
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->firstOrFail();

        $joinRequest = ClassJoinRequest::where('id', $id)
            ->where('kelas_id', $kelas->id)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::transaction(function() use ($joinRequest, $request, $kelas) {
            $joinRequest->update(['status' => $request->status]);

            if ($request->status === 'accepted') {
                // Remove student from any other class request they might have pending
                ClassJoinRequest::where('siswa_id', $joinRequest->siswa_id)
                    ->where('id', '!=', $joinRequest->id)
                    ->where('status', 'pending')
                    ->delete();

                // Update their official class
                SiswaProfile::updateOrCreate(
                    ['user_id' => $joinRequest->siswa_id],
                    ['kelas_id' => $kelas->id]
                );
            }
        });

        return response()->json(['message' => 'Permintaan berhasil ditanggapi']);
    }

    public function getSiswaKelas(Request $request)
    {
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->first();

        if (!$kelas) {
            return response()->json(['message' => 'Anda tidak terdaftar sebagai Wali Kelas.'], 404);
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
            'kelas_id' => $kelas->id,
            'kelas' => $kelas->nama_kelas,
            'siswa' => $siswa,
        ]);
    }

    public function searchSiswa(Request $request)
    {
        $query = $request->query('q');
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->firstOrFail();

        // Cari user role siswa yang belum di kelas ini
        $results = \App\Models\User::where('role', 'siswa')
            ->where('name', 'like', "%{$query}%")
            ->whereDoesntHave('siswaProfile', function($q) use ($kelas) {
                $q->where('kelas_id', $kelas->id);
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);
        
        return response()->json($results);
    }

    public function tambahSiswa(Request $request)
    {
        $request->validate(['siswa_id' => 'required|exists:users,id']);
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->firstOrFail();
        
        // Cek role siswa
        $siswaUser = \App\Models\User::where('id', $request->siswa_id)->where('role', 'siswa')->firstOrFail();

        SiswaProfile::updateOrCreate(
            ['user_id' => $siswaUser->id],
            ['kelas_id' => $kelas->id]
        );

        return response()->json(['message' => 'Siswa berhasil ditambahkan ke kelas']);
    }

    public function hapusSiswa(Request $request, $id)
    {
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->firstOrFail();
        
        $profile = SiswaProfile::where('user_id', $id)
            ->where('kelas_id', $kelas->id)
            ->firstOrFail();
            
        $profile->update(['kelas_id' => null]);

        return response()->json(['message' => 'Siswa berhasil dikeluarkan dari kelas']);
    }

    public function laporanIzin(Request $request)
    {
        $bulan = $request->query('bulan', now()->month);
        $tahun = $request->query('tahun', now()->year);
        $user = $request->user();
        
        $kelas = \App\Models\Kelas::where('wali_kelas_id', $user->id)->firstOrFail();
        
        $siswaProfiles = SiswaProfile::where('kelas_id', $kelas->id)
            ->with('user')
            ->get();
        
        $hariEfektif = $this->hitungHariEfektif($bulan, $tahun);

        $result = $siswaProfiles->map(function($profile) use ($bulan, $tahun, $hariEfektif) {
            $tickets = \App\Models\DispensasiTicket::where('siswa_id', $profile->user_id)
                ->whereMonth('created_at', $bulan)
                ->whereYear('created_at', $tahun)
                ->get();

            $totalIzin = $tickets->count();
            $sakit = $tickets->where('jenis_izin', 'sakit')->count();
            $keluarga = $tickets->where('jenis_izin', 'keperluan_keluarga')->count();
            $lainnya = $tickets->where('jenis_izin', 'lainnya')->count();
            
            // Only count approved tickets as reducing attendance
            $disetujui = $tickets->where('status', 'approved_final')->count();
            $ditolak = $tickets->where('status', 'rejected')->count();
            
            $persenHadir = $hariEfektif > 0 
                ? round((($hariEfektif - $disetujui) / $hariEfektif) * 100, 1) 
                : 100;

            return [
                'id' => $profile->user_id,
                'name' => $profile->user->name ?? 'Unknown',
                'nis' => $profile->nis,
                'total_izin' => $totalIzin,
                'sakit' => $sakit,
                'keperluan_keluarga' => $keluarga,
                'lainnya' => $lainnya,
                'disetujui' => $disetujui,
                'ditolak' => $ditolak,
                'persen_hadir' => $persenHadir,
            ];
        });

        return response()->json([
            'kelas' => $kelas->nama_kelas,
            'bulan_nama' => \Carbon\Carbon::create($tahun, $bulan)->translatedFormat('F'),
            'bulan' => (int)$bulan,
            'tahun' => (int)$tahun,
            'hari_efektif' => $hariEfektif,
            'siswa' => $result,
        ]);
    }

    private function hitungHariEfektif($bulan, $tahun)
    {
        $start = \Carbon\Carbon::create($tahun, $bulan, 1)->startOfMonth();
        $end = \Carbon\Carbon::create($tahun, $bulan, 1)->endOfMonth();
        $count = 0;

        while ($start <= $end) {
            if ($start->isWeekday()) { // Monday - Friday
                $count++;
            }
            $start->addDay();
        }

        return $count;
    }
}
