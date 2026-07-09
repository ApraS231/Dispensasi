<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ParentLinkRequest;
use App\Models\SiswaProfile;
use App\Models\Kelas;
use App\Services\ExpoPushService;

use Illuminate\Support\Facades\DB;

class ParentLinkController extends Controller
{
    public function searchSiswa(Request $request)
    {
        $query = $request->query('q');
        $kelasId = $request->query('kelas_id');

        $siswa = User::where('peran', 'siswa')
            ->when($query, function($q) use ($query) {
                $q->where('nama', 'like', "%$query%");
            })
            ->whereHas('siswaProfile', function($q) use ($kelasId) {
                $q->whereNull('id_orang_tua');
                if ($kelasId) {
                    $q->where('id_kelas', $kelasId);
                }
            })
            ->with(['siswaProfile.kelas'])
            ->limit(10)
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id_pengguna,
                    'name' => $user->nama,
                    'kelas' => $user->siswaProfile->kelas->nama_kelas ?? 'Tanpa Kelas',
                ];
            });

        return response()->json($siswa);
    }

    public function getKelas()
    {
        return response()->json(Kelas::orderBy('nama_kelas')->get());
    }

    public function sendRequest(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:pengguna,id_pengguna'
        ]);

        $parent = $request->user();
        $siswaId = $request->siswa_id;

        // Cek limit 2 anak
        $currentChildrenCount = SiswaProfile::where('id_orang_tua', $parent->id_pengguna)->count();
        $pendingRequestsCount = ParentLinkRequest::where('id_orang_tua', $parent->id_pengguna)
            ->where('status', 'pending')
            ->count();

        if ($currentChildrenCount + $pendingRequestsCount >= 2) {
            return response()->json(['message' => 'Maksimal 2 anak per akun orang tua.'], 400);
        }

        // Cek if already linked or requested
        $existingRequest = ParentLinkRequest::where('id_orang_tua', $parent->id_pengguna)
            ->where('id_siswa', $siswaId)
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'rejected') {
                $existingRequest->update(['status' => 'pending']);
                $linkRequest = $existingRequest;
            } else {
                return response()->json(['message' => 'Permintaan sudah ada.'], 400);
            }
        } else {
            $linkRequest = ParentLinkRequest::create([
                'id_orang_tua' => $parent->id_pengguna,
                'id_siswa' => $siswaId,
                'status' => 'pending'
            ]);
        }

        // Notify Siswa and Parent
        try {
            $siswa = User::find($siswaId);
            if ($siswa) {
                // 1. Notifikasi ke Siswa
                ExpoPushService::send(
                    $siswa->token_perangkat ?? [],
                    '👨‍👩‍👦 Hubungan Akun Orang Tua',
                    "{$parent->nama} ingin menghubungkan akun sebagai orang tua/wali Anda.",
                    [
                        'request_id' => $linkRequest->id_permintaan_hubung_ortu,
                        'type' => 'parent_link',
                        'reference_id' => $linkRequest->id_permintaan_hubung_ortu
                    ],
                    [$siswa->id_pengguna]
                );

                // 2. Notifikasi ke Orang Tua (Wali)
                ExpoPushService::send(
                    $parent->token_perangkat ?? [],
                    '👨‍👩‍👦 Hubungan Akun Orang Tua',
                    "Permintaan menghubungkan akun dengan {$siswa->nama} berhasil dikirim. Menunggu persetujuan siswa.",
                    [
                        'request_id' => $linkRequest->id_permintaan_hubung_ortu,
                        'type' => 'parent_link',
                        'reference_id' => $linkRequest->id_permintaan_hubung_ortu
                    ],
                    [$parent->id_pengguna]
                );
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal kirim notifikasi parent link request: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Permintaan berhasil dikirim', 'data' => $linkRequest]);
    }

    public function myRequests(Request $request)
    {
        $requests = ParentLinkRequest::where('id_orang_tua', $request->user()->id_pengguna)
            ->where('status', '!=', 'accepted')
            ->with(['siswa'])
            ->latest()
            ->get();
        return response()->json($requests);
    }

    public function cancelRequest(Request $request, $id)
    {
        $linkRequest = ParentLinkRequest::where('id_permintaan_hubung_ortu', $id)
            ->where('id_orang_tua', $request->user()->id_pengguna)
            ->whereIn('status', ['pending', 'rejected'])
            ->firstOrFail();

        $linkRequest->delete();
        return response()->json(['message' => 'Permintaan dibatalkan/dihapus']);
    }

    public function pendingRequests(Request $request)
    {
        $requests = ParentLinkRequest::where('id_siswa', $request->user()->id_pengguna)
            ->where('status', 'pending')
            ->with(['parent'])
            ->latest()
            ->get();
        return response()->json($requests);
    }

    public function respondRequest(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected'
        ]);

        $linkRequest = ParentLinkRequest::where('id_permintaan_hubung_ortu', $id)
            ->where('id_siswa', $request->user()->id_pengguna)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::transaction(function() use ($linkRequest, $request) {
            $linkRequest->update(['status' => $request->status]);

            if ($request->status === 'accepted') {
                SiswaProfile::where('id_pengguna', $linkRequest->id_siswa)
                    ->update(['id_orang_tua' => $linkRequest->id_orang_tua]);
            }
        });

        // Notify Parent and Siswa
        try {
            $parent = User::find($linkRequest->id_orang_tua);
            if ($parent) {
                $title = $request->status === 'accepted' ? 'Permintaan Diterima ✅' : 'Permintaan Ditolak';
                $bodyParent = $request->status === 'accepted' 
                    ? "{$request->user()->nama} telah mengkonfirmasi Anda sebagai wali."
                    : "{$request->user()->nama} menolak permintaan hubungan akun.";

                // 1. Notifikasi ke Orang Tua (Wali)
                ExpoPushService::send(
                    $parent->token_perangkat ?? [],
                    $title,
                    $bodyParent,
                    [
                        'request_id' => $linkRequest->id_permintaan_hubung_ortu,
                        'type' => 'parent_link_response',
                        'reference_id' => $linkRequest->id_permintaan_hubung_ortu
                    ],
                    [$parent->id_pengguna]
                );

                // 2. Notifikasi ke Siswa
                $bodySiswa = $request->status === 'accepted'
                    ? "Anda menyetujui {$parent->nama} sebagai orang tua/wali Anda."
                    : "Anda menolak permintaan hubungan akun dari {$parent->nama}.";

                ExpoPushService::send(
                    $request->user()->token_perangkat ?? [],
                    $title,
                    $bodySiswa,
                    [
                        'request_id' => $linkRequest->id_permintaan_hubung_ortu,
                        'type' => 'parent_link_response',
                        'reference_id' => $linkRequest->id_permintaan_hubung_ortu
                    ],
                    [$request->user()->id_pengguna]
                );
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal kirim notifikasi respon parent link: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Berhasil menanggapi permintaan']);
    }
}
