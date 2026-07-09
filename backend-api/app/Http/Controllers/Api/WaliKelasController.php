<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClassJoinRequest;
use App\Models\SiswaProfile;
use App\Models\User;
use App\Services\ExpoPushService;
use Illuminate\Support\Facades\DB;

class WaliKelasController extends Controller
{
    public function getClassRequests(Request $request)
    {
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->firstOrFail();

        $requests = ClassJoinRequest::where('id_kelas', $kelas->id_kelas)
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
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->firstOrFail();

        $joinRequest = ClassJoinRequest::where('id_permintaan_gabung_kelas', $id)
            ->where('id_kelas', $kelas->id_kelas)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::transaction(function() use ($joinRequest, $request, $kelas) {
            $joinRequest->update(['status' => $request->status]);

            if ($request->status === 'accepted') {
                // Remove student from any other class request they might have pending
                ClassJoinRequest::where('id_siswa', $joinRequest->id_siswa)
                    ->where('id_permintaan_gabung_kelas', '!=', $joinRequest->id_permintaan_gabung_kelas)
                    ->where('status', 'pending')
                    ->delete();

                // Update their official class
                SiswaProfile::updateOrCreate(
                    ['id_pengguna' => $joinRequest->id_siswa],
                    ['id_kelas' => $kelas->id_kelas]
                );
            }
        });

        // Kirim notifikasi ke Siswa dan Wali Kelas
        try {
            $siswa = User::find($joinRequest->id_siswa);
            if ($siswa) {
                $title = $request->status === 'accepted' ? '✅ Permintaan Kelas Diterima' : '❌ Permintaan Kelas Ditolak';
                $bodySiswa = $request->status === 'accepted' 
                    ? "Permintaan bergabung ke kelas {$kelas->nama_kelas} telah disetujui." 
                    : "Permintaan bergabung ke kelas {$kelas->nama_kelas} ditolak.";

                // 1. Notifikasi ke Siswa
                ExpoPushService::send(
                    $siswa->token_perangkat ?? [],
                    $title,
                    $bodySiswa,
                    [
                        'type' => 'class_request_response',
                        'status' => $request->status,
                        'reference_id' => $joinRequest->id_permintaan_gabung_kelas
                    ],
                    [$siswa->id_pengguna]
                );

                // 2. Notifikasi ke Wali Kelas
                $bodyWali = $request->status === 'accepted'
                    ? "Anda menyetujui {$siswa->nama} bergabung ke kelas {$kelas->nama_kelas}."
                    : "Anda menolak {$siswa->nama} bergabung ke kelas {$kelas->nama_kelas}.";

                ExpoPushService::send(
                    $user->token_perangkat ?? [],
                    $title,
                    $bodyWali,
                    [
                        'type' => 'class_request_response',
                        'status' => $request->status,
                        'reference_id' => $joinRequest->id_permintaan_gabung_kelas
                    ],
                    [$user->id_pengguna]
                );
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal kirim notifikasi respon gabung kelas: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Permintaan berhasil ditanggapi']);
    }

    public function getSiswaKelas(Request $request)
    {
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->first();

        if (!$kelas) {
            return response()->json(['message' => 'Anda tidak terdaftar sebagai Wali Kelas.'], 404);
        }

        $siswa = SiswaProfile::where('id_kelas', $kelas->id_kelas)
            ->with(['user', 'orangTua'])
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->id_pengguna,
                    'name' => $profile->user->nama ?? 'Unknown User',
                    'nis' => $profile->nis,
                    'has_parent' => $profile->id_orang_tua ? true : false,
                    'parent_name' => $profile->orangTua->nama ?? null,
                ];
            });

        return response()->json([
            'kelas_id' => $kelas->id_kelas,
            'kelas' => $kelas->nama_kelas,
            'siswa' => $siswa,
        ]);
    }

    public function searchSiswa(Request $request)
    {
        $query = $request->query('q');
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->firstOrFail();

        // Cari user role siswa yang belum di kelas ini
        $results = \App\Models\User::where('peran', 'siswa')
            ->where('nama', 'like', "%{$query}%")
            ->whereDoesntHave('siswaProfile', function($q) use ($kelas) {
                $q->where('id_kelas', $kelas->id_kelas);
            })
            ->limit(10)
            ->get(['id_pengguna', 'nama', 'email']);
        
        return response()->json($results);
    }

    public function tambahSiswa(Request $request)
    {
        $request->validate(['siswa_id' => 'required|exists:pengguna,id_pengguna']);
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->firstOrFail();
        
        // Cek role siswa
        $siswaUser = \App\Models\User::where('id_pengguna', $request->siswa_id)->where('peran', 'siswa')->firstOrFail();

        SiswaProfile::updateOrCreate(
            ['id_pengguna' => $siswaUser->id_pengguna],
            ['id_kelas' => $kelas->id_kelas]
        );

        return response()->json(['message' => 'Siswa berhasil ditambahkan ke kelas']);
    }

    public function hapusSiswa(Request $request, $id)
    {
        $user = $request->user();
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->firstOrFail();
        
        $profile = SiswaProfile::where('id_pengguna', $id)
            ->where('id_kelas', $kelas->id_kelas)
            ->firstOrFail();
            
        $profile->update(['id_kelas' => null]);

        return response()->json(['message' => 'Siswa berhasil dikeluarkan dari kelas']);
    }

    public function laporanIzin(Request $request)
    {
        $bulan = $request->query('bulan', now()->month);
        $tahun = $request->query('tahun', now()->year);
        $user = $request->user();
        
        $kelas = \App\Models\Kelas::where('id_wali_kelas', $user->id_pengguna)->firstOrFail();
        
        $siswaProfiles = SiswaProfile::where('id_kelas', $kelas->id_kelas)
            ->with('user')
            ->get();
        
        $hariEfektif = $this->hitungHariEfektif($bulan, $tahun);

        // Pre-load semua tiket sekaligus (fix N+1 query)
        $allTickets = \App\Models\DispensasiTicket::whereIn('id_siswa', $siswaProfiles->pluck('id_pengguna'))
            ->whereMonth('created_at', $bulan)
            ->whereYear('created_at', $tahun)
            ->get()
            ->groupBy('id_siswa');

        $result = $siswaProfiles->map(function($profile) use ($allTickets, $hariEfektif) {
            $tickets = $allTickets[$profile->id_pengguna] ?? collect();

            $totalIzin = $tickets->count();
            $sakit = $tickets->where('jenis_izin', 'sakit')->count();
            $izin = $tickets->where('jenis_izin', 'izin')->count();
            $dispensasi = $tickets->where('jenis_izin', 'dispensasi')->count();

            // Only count approved tickets as reducing attendance
            $disetujui = $tickets->whereIn('status', ['approved_final', 'completed_exit'])->count();
            $ditolak = $tickets->where('status', 'rejected')->count();

            $persenHadir = $hariEfektif > 0
                ? round((($hariEfektif - $disetujui) / $hariEfektif) * 100, 1)
                : 100;

            return [
                'id' => $profile->id_pengguna,
                'name' => $profile->user->nama ?? 'Unknown',
                'nis' => $profile->nis,
                'total_izin' => $totalIzin,
                'sakit' => $sakit,
                'izin' => $izin,
                'dispensasi' => $dispensasi,
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
