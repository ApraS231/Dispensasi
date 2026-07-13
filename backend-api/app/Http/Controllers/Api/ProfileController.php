<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

use App\Models\SiswaProfile;
use App\Models\ClassJoinRequest;
use App\Models\User;
use App\Services\ExpoPushService;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:pengguna,email,'.$user->id_pengguna.',id_pengguna',
            'nis' => 'nullable|string',
            'kelas_id' => 'nullable|exists:kelas,id_kelas',
            'profile_photo' => 'nullable|image|max:2048', // max 2MB
            'nidn' => 'nullable|string|max:50'
        ]);

        if ($request->has('name')) {
            $user->nama = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if (in_array($user->peran, ['wali_kelas', 'guru_piket'])) {
            if ($request->has('nidn')) {
                $user->nidn = $request->nidn;
            }
        }

        // Handle Siswa Profile (NIS & Kelas Request)
        if ($user->peran === 'siswa') {
            $profile = SiswaProfile::firstOrCreate(['id_pengguna' => $user->id_pengguna]);
            
            if ($request->has('nis')) {
                $profile->update(['nis' => $request->nis]);
            }

            if ($request->has('kelas_id') && $request->kelas_id !== $profile->id_kelas) {
                // Create or update class join request
                $joinRequest = ClassJoinRequest::updateOrCreate(
                    ['id_siswa' => $user->id_pengguna, 'status' => 'pending'],
                    ['id_kelas' => $request->kelas_id]
                );

                $kelas = \App\Models\Kelas::find($request->kelas_id);
                if ($kelas) {
                    $kelasNama = $kelas->nama_kelas;
                    $waliKelasId = $kelas->id_wali_kelas;

                    try {
                        // 1. Notifikasi ke Wali Kelas
                        if ($waliKelasId) {
                            $waliKelas = User::find($waliKelasId);
                            if ($waliKelas) {
                                ExpoPushService::send(
                                    $waliKelas->token_perangkat ?? [],
                                    '📝 Permintaan Gabung Kelas',
                                    "{$user->nama} mengajukan bergabung ke kelas {$kelasNama}.",
                                    [
                                        'type' => 'new_class_request',
                                        'siswa_id' => $user->id_pengguna,
                                        'reference_id' => $joinRequest->id_permintaan_gabung_kelas
                                    ],
                                    [$waliKelasId]
                                );
                            }
                        }

                        // 2. Notifikasi ke Siswa
                        ExpoPushService::send(
                            $user->token_perangkat ?? [],
                            '📝 Permintaan Gabung Kelas',
                            "Anda mengajukan bergabung ke kelas {$kelasNama}. Menunggu persetujuan wali kelas.",
                            [
                                'type' => 'new_class_request',
                                'siswa_id' => $user->id_pengguna,
                                'reference_id' => $joinRequest->id_permintaan_gabung_kelas
                            ],
                            [$user->id_pengguna]
                        );
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning('Gagal kirim notifikasi update profil gabung kelas: ' . $e->getMessage());
                    }
                }
            }
        }

        if ($request->hasFile('profile_photo')) {
            try {
                // Delete old photo from Supabase if exists
                if ($user->url_foto_profil) {
                    $supabaseBaseUrl = config('filesystems.disks.supabase.url');
                    if ($supabaseBaseUrl && str_starts_with($user->url_foto_profil, $supabaseBaseUrl)) {
                        $oldPath = str_replace($supabaseBaseUrl . '/', '', $user->url_foto_profil);
                        Storage::disk('supabase')->delete($oldPath);
                    }
                }

                $file = $request->file('profile_photo');
                $extension = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'jpg');
                $fileName = (string) \Illuminate\Support\Str::uuid() . '.' . $extension;
                $path = $file->storeAs('profile-photos', $fileName, 'supabase');

                if ($path) {
                    $user->url_foto_profil = Storage::disk('supabase')->url($path);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal upload foto profil: " . $e->getMessage());
            }
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user->load('siswaProfile.kelas', 'kelasWali')
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', 'min:8', 'different:current_password'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password lama tidak sesuai'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password berhasil diperbarui']);
    }
}
