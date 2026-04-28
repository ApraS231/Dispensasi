<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TicketChat;
use App\Models\DispensasiTicket;
use App\Models\User;
use App\Models\SiswaProfile;
use App\Services\ExpoPushService;

class TicketChatController extends Controller
{
    private function checkAccess($user, $ticket)
    {
        if ($ticket->siswa_id === $user->id) return true;
        if ($ticket->wali_kelas_id === $user->id) return true;
        if ($ticket->guru_piket_id === $user->id) return true;
        
        if ($user->role === 'orang_tua') {
            $isAnak = SiswaProfile::where('orang_tua_id', $user->id)
                ->where('user_id', $ticket->siswa_id)
                ->exists();
            if ($isAnak) return true;
        }

        return false;
    }

    public function index(Request $request, $ticketId)
    {
        $ticket = DispensasiTicket::findOrFail($ticketId);
        
        if (!$this->checkAccess($request->user(), $ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $limit = $request->query('limit', 20);
        $cursor = $request->query('cursor');

        $query = TicketChat::with('sender')->where('dispensasi_ticket_id', $ticketId);

        if ($cursor && $cursor !== 'null') {
            $cursorMessage = TicketChat::find($cursor);
            if ($cursorMessage) {
                $query->where('created_at', '<', $cursorMessage->created_at);
            }
        }

        $chats = $query->orderBy('created_at', 'desc')->limit($limit)->get();

        $nextCursor = $chats->count() === (int)$limit ? $chats->last()->id : null;

        return response()->json([
            'data' => $chats,
            'next_cursor' => $nextCursor
        ]);
    }

    public function store(Request $request, $ticketId)
    {
        $ticket = DispensasiTicket::findOrFail($ticketId);
        
        if (!$this->checkAccess($request->user(), $ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'pesan' => 'required|string'
        ]);

        $chat = TicketChat::create([
            'dispensasi_ticket_id' => $ticketId,
            'sender_id' => $request->user()->id,
            'pesan' => $request->pesan
        ]);

        $chat->load('sender');

        $this->sendChatNotification($ticket, $chat, $request->user());

        return response()->json(['data' => $chat], 201);
    }

    private function sendChatNotification($ticket, $chat, $sender)
    {
        $targetUserIds = array_filter([
            $ticket->siswa_id,
            $ticket->wali_kelas_id,
            $ticket->guru_piket_id
        ]);

        $ortu = SiswaProfile::where('user_id', $ticket->siswa_id)->value('orang_tua_id');
        if ($ortu) {
            $targetUserIds[] = $ortu;
        }

        $targetUserIds = array_unique($targetUserIds);
        
        if (($key = array_search($sender->id, $targetUserIds)) !== false) {
            unset($targetUserIds[$key]);
        }

        $tokens = User::whereIn('id', $targetUserIds)
            ->whereNotNull('device_token')
            ->pluck('device_token')
            ->toArray();

        if (!empty($tokens)) {
            ExpoPushService::send(
                $tokens,
                'Pesan Baru: ' . $sender->name,
                $chat->pesan,
                ['ticket_id' => $ticket->id, 'type' => 'chat']
            );
        }
    }
}
