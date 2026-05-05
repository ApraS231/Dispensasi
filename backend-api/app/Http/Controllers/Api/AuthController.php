<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
