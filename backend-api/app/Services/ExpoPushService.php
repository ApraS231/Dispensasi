<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;

class ExpoPushService
{
    /**
     * Fungsi untuk mengirim notifikasi ke Expo
     * 
     * @param string|array $to (Satu token string atau array token)
     * @param string $title (Judul Notif)
     * @param string $body (Isi pesan)
     * @param array $data (Data tambahan opsional, misal ID tiket)
     * @param array $logForUserIds (Array User ID untuk disimpan di db)
     */
    public static function send($to, $title, $body, $data = [], $logForUserIds = [])
    {
        // 1. Simpan Log ke DB (Bahkan jika $to kosong, notif tetap tersimpan di aplikasi)
        if (!empty($logForUserIds)) {
            foreach ($logForUserIds as $userId) {
                try {
                    Notification::create([
                        'user_id' => $userId,
                        'title' => $title,
                        'body' => $body,
                        'tipe' => $data['type'] ?? 'info',
                        'reference_id' => $data['reference_id'] ?? $data['ticket_id'] ?? null,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Gagal simpan log notifikasi: ' . $e->getMessage());
                }
            }
        }

        if (empty($to)) return false;

        $rawTokens = is_array($to) ? $to : [$to];
        $tokens = [];
        foreach ($rawTokens as $t) {
            if (is_string($t)) {
                $trimmed = trim($t);
                if ($trimmed !== '') {
                    $tokens[] = $trimmed;
                }
            }
        }

        $messages = [];
        foreach ($tokens as $token) {
            // Validasi format Expo Token
            if (strpos($token, 'ExponentPushToken') !== 0 && strpos($token, 'ExpoPushToken') !== 0) {
                Log::warning('Token notifikasi tidak valid formatnya: ' . $token);
                continue;
            }

            $messages[] = [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default'
            ];
        }

        if (empty($messages)) return false;

        Log::info('Mengirim push notifikasi ke Expo', [
            'total_messages' => count($messages),
            'tokens' => array_column($messages, 'to')
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-Encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])
            ->timeout(10)
            ->post('https://exp.host/--/api/v2/push/send', $messages);

            $result = $response->json();
            Log::info('Expo Push Response', [
                'status' => $response->status(),
                'response' => $result
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Gagal kirim Expo Push: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return false;
        }
    }
}
