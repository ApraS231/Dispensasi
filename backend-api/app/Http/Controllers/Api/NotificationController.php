<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifs = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($notifs);
    }

    public function update(Request $request, $id)
    {
        $notif = Notification::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $notif->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }
}
