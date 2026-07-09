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
        // Admin always has access
        if ($user->peran === 'admin') return true;
        
        // Ownership access
        if ($ticket->id_siswa === $user->id_pengguna) return true;
        if ($ticket->id_wali_kelas === $user->id_pengguna) return true;
        if ($ticket->id_guru_piket === $user->id_pengguna) return true;
        
        // Staff access (Guru Piket can view all chats to process tickets)
        if ($user->peran === 'guru_piket') return true;
        
        // Parent access to their child's ticket
        if ($user->peran === 'orang_tua') {
            $isAnak = SiswaProfile::where('id_orang_tua', $user->id_pengguna)
                ->where('id_pengguna', $ticket->id_siswa)
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

        $query = TicketChat::with('sender')->where('id_tiket_dispensasi', $ticketId);

        if ($cursor && $cursor !== 'null') {
            $cursorMessage = TicketChat::find($cursor);
            if ($cursorMessage) {
                $query->where('created_at', '<', $cursorMessage->created_at);
            }
        }

        $chats = $query->orderBy('created_at', 'desc')->limit($limit)->get();

        $nextCursor = $chats->count() === (int)$limit ? $chats->last()->id_obrolan_tiket : null;

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
        if ($ticket->isExpired()) {
            return response()->json([
                'message' => 'Sesi chat telah berakhir. Tiket ini sudah kedaluwarsa.'
            ], 403);
        }


        $request->validate([
            'pesan' => 'nullable|string',
            'lampiran_chat' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if (!$request->pesan && !$request->hasFile('lampiran_chat')) {
            return response()->json(['message' => 'Pesan atau lampiran harus diisi'], 422);
        }

        $user = $request->user();
        $attachmentUrl = null;

        if ($request->hasFile('lampiran_chat')) {
            // Cek role: Hanya siswa dan orang tua yang boleh kirim gambar
            if (!in_array($user->peran, ['siswa', 'orang_tua'])) {
                return response()->json(['message' => 'Hanya siswa dan orang tua yang dapat mengirim gambar di chat.'], 403);
            }

            try {
                $file = $request->file('lampiran_chat');
                // Buat nama file acak berbasis UUID agar aman, pastikan extension lowercase
                $extension = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'jpg');
                $fileName = (string) \Illuminate\Support\Str::uuid() . '.' . $extension;
                $path = $file->storeAs('chat_attachments', $fileName, 'supabase');
                
                if ($path) {
                    $attachmentUrl = \Illuminate\Support\Facades\Storage::disk('supabase')->url($path);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal upload lampiran chat ke Supabase: " . $e->getMessage());
                return response()->json(['message' => 'Gagal mengunggah gambar lampiran chat ke penyimpanan cloud: ' . $e->getMessage()], 500);
            }
        }

        $chat = TicketChat::create([
            'id_tiket_dispensasi' => $ticketId,
            'id_pengirim' => $user->id_pengguna,
            'pesan' => $request->pesan ?? '',
            'url_lampiran' => $attachmentUrl
        ]);

        $chat->load('sender');

        try {
            $this->sendChatNotification($ticket, $chat, $request->user());
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Chat notification failed: ' . $e->getMessage());
        }

        return response()->json(['data' => $chat], 201);
    }

    private function sendChatNotification($ticket, $chat, $sender)
    {
        $targetUserIds = array_filter([
            $ticket->id_siswa,
            $ticket->id_wali_kelas,
            $ticket->id_guru_piket
        ]);

        $ortu = SiswaProfile::where('id_pengguna', $ticket->id_siswa)->value('id_orang_tua');
        if ($ortu) {
            $targetUserIds[] = $ortu;
        }

        $targetUserIds = array_unique($targetUserIds);
        
        if (($key = array_search($sender->id_pengguna, $targetUserIds)) !== false) {
            unset($targetUserIds[$key]);
        }

        $tokens = User::whereIn('id_pengguna', $targetUserIds)
            ->whereNotNull('token_perangkat')
            ->pluck('token_perangkat')
            ->toArray();

        // Pass $targetUserIds to ExpoPushService for logging, even if tokens is empty
        ExpoPushService::send(
            $tokens,
            'Pesan Baru: ' . $sender->nama,
            $chat->pesan ?: '[Gambar]',
            ['ticket_id' => $ticket->id_tiket_dispensasi, 'type' => 'chat'],
            array_values($targetUserIds) // Reset keys
        );
    }
}
