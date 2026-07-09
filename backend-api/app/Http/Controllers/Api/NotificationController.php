<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifs = Notification::where('id_pengguna', $request->user()->id_pengguna)
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);
        return response()->json($notifs);
    }

    public function update(Request $request, $id)
    {
        $notif = Notification::where('id_notifikasi', $id)->where('id_pengguna', $request->user()->id_pengguna)->firstOrFail();
        $notif->update(['sudah_dibaca' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead(Request $request)
    {
        Notification::where('id_pengguna', $request->user()->id_pengguna)
            ->where('sudah_dibaca', false)
            ->update(['sudah_dibaca' => true]);
        return response()->json(['message' => 'All marked as read']);
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::where('id_pengguna', $request->user()->id_pengguna)
            ->where('sudah_dibaca', false)
            ->count();
        return response()->json(['count' => $count]);
    }
}
