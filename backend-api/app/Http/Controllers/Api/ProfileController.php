<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,'.$user->id,
            'oldPassword' => 'nullable|string',
            'newPassword' => ['nullable', 'string', 'min:8'],
            'profile_photo' => 'nullable|image|max:2048' // max 2MB
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->filled('oldPassword') && $request->filled('newPassword')) {
            if (!Hash::check($request->oldPassword, $user->password)) {
                return response()->json(['message' => 'Password lama tidak sesuai'], 400);
            }
            $user->password = Hash::make($request->newPassword);
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
            'user' => $user->load('siswaProfile', 'kelasWali')
        ]);
    }
}
