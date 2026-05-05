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

        $siswa = User::where('role', 'siswa')
            ->when($query, function($q) use ($query) {
                $q->where('name', 'like', "%$query%");
            })
            ->whereHas('siswaProfile', function($q) use ($kelasId) {
                $q->whereNull('orang_tua_id');
                if ($kelasId) {
                    $q->where('kelas_id', $kelasId);
                }
            })
            ->with(['siswaProfile.kelas'])
            ->limit(10)
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
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
            'siswa_id' => 'required|exists:users,id'
        ]);

        $parent = $request->user();
        $siswaId = $request->siswa_id;

        // Cek limit 2 anak
        $currentChildrenCount = SiswaProfile::where('orang_tua_id', $parent->id)->count();
        $pendingRequestsCount = ParentLinkRequest::where('parent_id', $parent->id)
            ->where('status', 'pending')
            ->count();

        if ($currentChildrenCount + $pendingRequestsCount >= 2) {
            return response()->json(['message' => 'Maksimal 2 anak per akun orang tua.'], 400);
        }

        // Cek if already linked or requested
        $existingRequest = ParentLinkRequest::where('parent_id', $parent->id)
            ->where('siswa_id', $siswaId)
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'Permintaan sudah ada.'], 400);
        }

        $linkRequest = ParentLinkRequest::create([
            'parent_id' => $parent->id,
            'siswa_id' => $siswaId,
            'status' => 'pending'
        ]);

        // Notify Siswa
        $siswa = User::find($siswaId);
        if ($siswa) {
            ExpoPushService::send(
                $siswa->device_token ?? [],
                'Permintaan Orang Tua',
                "{$parent->name} ingin menghubungkan akun sebagai wali Anda.",
                ['request_id' => $linkRequest->id, 'type' => 'parent_link'],
                [$siswa->id]
            );
        }

        return response()->json(['message' => 'Permintaan berhasil dikirim', 'data' => $linkRequest]);
    }

    public function myRequests(Request $request)
    {
        $requests = ParentLinkRequest::where('parent_id', $request->user()->id)
            ->with(['siswa'])
            ->latest()
            ->get();
        return response()->json($requests);
    }

    public function cancelRequest(Request $request, $id)
    {
        $linkRequest = ParentLinkRequest::where('id', $id)
            ->where('parent_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $linkRequest->delete();
        return response()->json(['message' => 'Permintaan dibatalkan']);
    }

    public function pendingRequests(Request $request)
    {
        $requests = ParentLinkRequest::where('siswa_id', $request->user()->id)
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

        $linkRequest = ParentLinkRequest::where('id', $id)
            ->where('siswa_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::transaction(function() use ($linkRequest, $request) {
            $linkRequest->update(['status' => $request->status]);

            if ($request->status === 'accepted') {
                SiswaProfile::where('user_id', $linkRequest->siswa_id)
                    ->update(['orang_tua_id' => $linkRequest->parent_id]);
            }
        });

        // Notify Parent
        $parent = User::find($linkRequest->parent_id);
        if ($parent) {
            $title = $request->status === 'accepted' ? 'Permintaan Diterima ✅' : 'Permintaan Ditolak';
            $body = $request->status === 'accepted' 
                ? "{$request->user()->name} telah mengkonfirmasi Anda sebagai wali."
                : "{$request->user()->name} menolak permintaan hubungan akun.";

            ExpoPushService::send(
                $parent->device_token ?? [],
                $title,
                $body,
                ['request_id' => $linkRequest->id, 'type' => 'parent_link_response'],
                [$parent->id]
            );
        }

        return response()->json(['message' => 'Berhasil menanggapi permintaan']);
    }
}
