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
            'email' => 'nullable|email|unique:users,email,'.$user->id,
            'nis' => 'nullable|string',
            'kelas_id' => 'nullable|exists:kelas,id',
            'profile_photo' => 'nullable|image|max:2048' // max 2MB
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        // Handle Siswa Profile (NIS & Kelas Request)
        if ($user->role === 'siswa') {
            $profile = SiswaProfile::firstOrCreate(['user_id' => $user->id]);
            
            if ($request->has('nis')) {
                $profile->update(['nis' => $request->nis]);
            }

            if ($request->has('kelas_id') && $request->kelas_id !== $profile->kelas_id) {
                // Create or update class join request
                $joinRequest = ClassJoinRequest::updateOrCreate(
                    ['siswa_id' => $user->id, 'status' => 'pending'],
                    ['kelas_id' => $request->kelas_id]
                );

                $kelas = \App\Models\Kelas::find($request->kelas_id);
                if ($kelas) {
                    $kelasNama = $kelas->nama_kelas;
                    $waliKelasId = $kelas->wali_kelas_id;

                    try {
                        // 1. Notifikasi ke Wali Kelas
                        if ($waliKelasId) {
                            $waliKelas = User::find($waliKelasId);
                            if ($waliKelas) {
                                ExpoPushService::send(
                                    $waliKelas->device_token ?? [],
                                    '📝 Permintaan Gabung Kelas',
                                    "{$user->name} mengajukan bergabung ke kelas {$kelasNama}.",
                                    [
                                        'type' => 'new_class_request',
                                        'siswa_id' => $user->id,
                                        'reference_id' => $joinRequest->id
                                    ],
                                    [$waliKelasId]
                                );
                            }
                        }

                        // 2. Notifikasi ke Siswa
                        ExpoPushService::send(
                            $user->device_token ?? [],
                            '📝 Permintaan Gabung Kelas',
                            "Anda mengajukan bergabung ke kelas {$kelasNama}. Menunggu persetujuan wali kelas.",
                            [
                                'type' => 'new_class_request',
                                'siswa_id' => $user->id,
                                'reference_id' => $joinRequest->id
                            ],
                            [$user->id]
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
                if ($user->profile_photo_url) {
                    $supabaseBaseUrl = config('filesystems.disks.supabase.url');
                    if ($supabaseBaseUrl && str_starts_with($user->profile_photo_url, $supabaseBaseUrl)) {
                        $oldPath = str_replace($supabaseBaseUrl . '/', '', $user->profile_photo_url);
                        Storage::disk('supabase')->delete($oldPath);
                    }
                }

                $file = $request->file('profile_photo');
                $fileName = (string) \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile-photos', $fileName, 'supabase');

                if ($path) {
                    $user->profile_photo_url = Storage::disk('supabase')->url($path);
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
