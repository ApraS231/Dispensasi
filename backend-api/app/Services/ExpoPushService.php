<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    /**
     * Fungsi untuk mengirim notifikasi ke Expo
     * 
     * @param string|array $to (Satu token string atau array token)
     * @param string $title (Judul Notif)
     * @param string $body (Isi pesan)
     * @param array $data (Data tambahan opsional, misal ID tiket)
     */
    public static function send($to, $title, $body, $data = [])
    {
        if (empty($to)) return false;

        $payload = [
            'to' => $to,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'sound' => 'default'
        ];

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-Encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $payload);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Gagal kirim Expo Push: ' . $e->getMessage());
            return false;
        }
    }
}
