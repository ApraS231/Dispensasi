<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SiswaProfile;
use App\Models\ClassJoinRequest;
use App\Models\Kelas;
use App\Services\ExpoPushService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'nis' => 'required|string|unique:siswa_profiles,nis',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        try {
            $waliKelasId = null;
            $kelasNama = '';
            $siswaName = '';
            $siswaId = null;

            $result = DB::transaction(function () use ($request, &$waliKelasId, &$kelasNama, &$siswaName, &$siswaId) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'siswa',
                ]);

                SiswaProfile::create([
                    'user_id' => $user->id,
                    'nis' => $request->nis,
                    'kelas_id' => null, // Officially unassigned until approved
                ]);

                ClassJoinRequest::create([
                    'siswa_id' => $user->id,
                    'kelas_id' => $request->kelas_id,
                    'status' => 'pending',
                ]);

                $siswaId = $user->id;
                $siswaName = $user->name;

                $kelas = Kelas::find($request->kelas_id);
                if ($kelas) {
                    $kelasNama = $kelas->nama_kelas;
                    $waliKelasId = $kelas->wali_kelas_id;
                }

                $token = $user->createToken('mobile-app-token')->plainTextToken;

                return [
                    'user' => $user->load('siswaProfile', 'kelasWali'),
                    'token' => $token,
                ];
            });

            // Kirim notifikasi ke Wali Kelas di luar transaksi
            if ($waliKelasId) {
                $waliKelas = User::find($waliKelasId);
                if ($waliKelas) {
                    ExpoPushService::send(
                        $waliKelas->device_token ?? [],
                        '📝 Permintaan Gabung Kelas',
                        "{$siswaName} mengajukan bergabung ke kelas {$kelasNama}.",
                        ['type' => 'new_class_request', 'siswa_id' => $siswaId],
                        [$waliKelasId]
                    );
                }
            }

            return response()->json([
                'user' => $result['user'],
                'token' => $result['token'],
                'message' => 'Registrasi berhasil. Silakan tunggu persetujuan kelas dari Wali Kelas.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Registrasi gagal: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_token' => 'nullable|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Kredensial salah'], 401);
        }

        if ($request->has('device_token')) {
            $user->update(['device_token' => $request->device_token]);
        }

        $token = $user->createToken('mobile-app-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('siswaProfile', 'kelasWali'),
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function updateDeviceToken(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string'
        ]);

        $request->user()->update([
            'device_token' => $request->device_token
        ]);

        return response()->json(['message' => 'Device token updated successfully']);
    }
}
