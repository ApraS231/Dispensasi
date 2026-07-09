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
            'email' => 'required|string|email|max:255|unique:pengguna,email',
            'password' => 'required|string|min:8',
            'nis' => 'required|string|unique:profil_siswa,nis',
            'kelas_id' => 'required|exists:kelas,id_kelas',
        ]);

        try {
            $waliKelasId = null;
            $kelasNama = '';
            $siswaName = '';
            $siswaId = null;
            $classJoinRequestId = null;

            $result = DB::transaction(function () use ($request, &$waliKelasId, &$kelasNama, &$siswaName, &$siswaId, &$classJoinRequestId) {
                $user = User::create([
                    'nama' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'peran' => 'siswa',
                ]);

                SiswaProfile::create([
                    'id_pengguna' => $user->id_pengguna,
                    'nis' => $request->nis,
                    'id_kelas' => null, // Officially unassigned until approved
                ]);

                $joinRequest = ClassJoinRequest::create([
                    'id_siswa' => $user->id_pengguna,
                    'id_kelas' => $request->kelas_id,
                    'status' => 'pending',
                ]);
                $classJoinRequestId = $joinRequest->id_permintaan_gabung_kelas;

                $siswaId = $user->id_pengguna;
                $siswaName = $user->nama;

                $kelas = Kelas::find($request->kelas_id);
                if ($kelas) {
                    $kelasNama = $kelas->nama_kelas;
                    $waliKelasId = $kelas->id_wali_kelas;
                }

                $token = $user->createToken('mobile-app-token')->plainTextToken;

                return [
                    'user' => $user->load('siswaProfile', 'kelasWali'),
                    'token' => $token,
                ];
            });

            // Kirim notifikasi ke Wali Kelas dan Siswa di luar transaksi
            try {
                if ($waliKelasId) {
                    $waliKelas = User::find($waliKelasId);
                    if ($waliKelas) {
                        ExpoPushService::send(
                            $waliKelas->token_perangkat ?? [],
                            '📝 Permintaan Gabung Kelas',
                            "{$siswaName} mengajukan bergabung ke kelas {$kelasNama}.",
                            [
                                'type' => 'new_class_request',
                                'siswa_id' => $siswaId,
                                'reference_id' => $classJoinRequestId
                            ],
                            [$waliKelasId]
                        );
                    }
                }

                if ($siswaId) {
                    $siswa = User::find($siswaId);
                    if ($siswa) {
                        ExpoPushService::send(
                            $siswa->token_perangkat ?? [],
                            '📝 Permintaan Gabung Kelas',
                            "Anda mengajukan bergabung ke kelas {$kelasNama}. Menunggu persetujuan wali kelas.",
                            [
                                'type' => 'new_class_request',
                                'siswa_id' => $siswaId,
                                'reference_id' => $classJoinRequestId
                            ],
                            [$siswaId]
                        );
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Gagal kirim notifikasi pendaftaran kelas: ' . $e->getMessage());
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

        if ($request->has('device_token') && $request->device_token) {
            \Illuminate\Support\Facades\Log::info('Device token updated during login', [
                'user_id' => $user->id_pengguna,
                'email' => $user->email,
                'token_prefix' => substr($request->device_token, 0, 30)
            ]);
            $user->update(['token_perangkat' => $request->device_token]);
        }

        $token = $user->createToken('mobile-app-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('siswaProfile', 'kelasWali'),
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->update(['token_perangkat' => null]);
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function updateDeviceToken(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string'
        ]);

        \Illuminate\Support\Facades\Log::info('Device token update requested', [
            'user_id' => $request->user()->id_pengguna,
            'email' => $request->user()->email,
            'token_prefix' => substr($request->device_token, 0, 30)
        ]);

        $request->user()->update([
            'token_perangkat' => $request->device_token
        ]);

        return response()->json(['message' => 'Device token updated successfully']);
    }
}
