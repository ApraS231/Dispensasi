<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TicketChat;
use App\Models\DispensasiTicket;

class TicketChatController extends Controller
{
    public function index($ticketId)
    {
        $chats = TicketChat::with('sender')->where('dispensasi_ticket_id', $ticketId)->get();
        return response()->json($chats);
    }

    public function store(Request $request, $ticketId)
    {
        $request->validate([
            'pesan' => 'required|string'
        ]);

        $chat = TicketChat::create([
            'dispensasi_ticket_id' => $ticketId,
            'sender_id' => $request->user()->id,
            'pesan' => $request->pesan
        ]);

        return response()->json($chat, 201);
    }
}
