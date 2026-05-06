<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

use App\Models\SiswaProfile;
use App\Models\ClassJoinRequest;

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
                ClassJoinRequest::updateOrCreate(
                    ['siswa_id' => $user->id, 'status' => 'pending'],
                    ['kelas_id' => $request->kelas_id]
                );
            }
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_url) {
                // Delete old photo if exists
                $oldPath = str_replace(url('/storage').'/', '', $user->profile_photo_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo_url = url('/storage/' . $path);
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
