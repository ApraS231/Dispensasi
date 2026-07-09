<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PiketSchedule;
use App\Models\SiswaProfile;
use App\Models\User;
use App\Models\DispensasiTicket;
use App\Services\ExpoPushService;

class PiketController extends Controller
{
    public function getStatus(Request $request)
    {
        $user = $request->user();

        $now = now();
        $hariMap = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];
        $hariIni = $hariMap[$now->dayOfWeekIso];
        $jamIni = $now->format('H:i:s');

        $aktif = PiketSchedule::where('id_guru', $user->id_pengguna)
            ->where('hari', $hariIni)
            ->where('jam_mulai', '<=', $jamIni)
            ->where('jam_selesai', '>=', $jamIni)
            ->exists();

        return response()->json(['is_ready' => $aktif]);
    }


    public function getQueue(Request $request)
    {
        $now = now();
        $guruId = $request->user()->id_pengguna;

        // 1. Cek apakah Guru ini sedang masuk jadwal Shift
        $isScheduledNow = PiketSchedule::where('id_guru', $guruId)
            ->where('hari', [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'][$now->dayOfWeekIso])
            ->where('jam_mulai', '<=', $now->format('H:i:s'))
            ->where('jam_selesai', '>=', $now->format('H:i:s'))
            ->exists();

        // Jika di luar jadwal, kembalikan status false agar UI menyesuaikan
        if (!$isScheduledNow) {
            return response()->json([
                'is_active_shift' => false,
                'data' => [],
                'message' => 'Saat ini Anda sedang tidak dalam jadwal piket.'
            ]);
        }

        // 2. Tarik semua tiket dari Pool (FIFO - First In First Out)
        $queue = DispensasiTicket::with(['siswa', 'kelas'])
            ->where('status', 'waiting_piket')
            ->whereNull('id_guru_piket')
            ->orderBy('created_at', 'asc') // Yang paling lama menunggu ada di atas
            ->get();

        return response()->json([
            'is_active_shift' => true,
            'data' => $queue
        ]);
    }


    public function validateQR(Request $request) {
        $request->validate(['qr_token' => 'required|uuid']);

        $ticket = \App\Models\DispensasiTicket::where('token_qr', $request->qr_token)->first();

        if (!$ticket) {
            return response()->json(['valid' => false, 'message' => 'QR Code Palsu / Tidak Dikenali'], 404);
        }

        if ($ticket->isExpired()) {
            return response()->json([
                'valid' => false,
                'message' => 'Akses Ditolak: Tiket ini sudah KEDALUWARSA!'
            ], 400);
        }

        if ($ticket->waktu_pindai !== null) {
            return response()->json(['valid' => false, 'message' => 'QR Code ini sudah pernah dipakai!'], 400);
        }

        // Jika Valid, kunci tiket
        $ticket->update([
            'status' => 'completed_exit',
            'sudah_dipindai' => true,
            'waktu_pindai' => now(),
            'id_pemindai' => $request->user()->id_pengguna
        ]);

        $ticket->load('siswa'); // Load relasi siswa untuk nama

        try {
            // Notifikasi ke Siswa
            if ($ticket->siswa) {
                ExpoPushService::send(
                    $ticket->siswa->token_perangkat ?? [],
                    '🚪 QR Tervalidasi',
                    "Izin Anda telah divalidasi di gerbang.",
                    ['ticket_id' => $ticket->id_tiket_dispensasi, 'type' => 'qr_validated'],
                    [$ticket->siswa->id_pengguna]
                );
            }

            // Notifikasi ke Orang Tua
            $profil = SiswaProfile::where('id_pengguna', $ticket->id_siswa)->first();
            if ($profil && $profil->id_orang_tua) {
                $ortu = User::find($profil->id_orang_tua);
                if ($ortu) {
                    $namaAnak = $ticket->siswa->nama ?? 'Anak Anda';
                    ExpoPushService::send(
                        $ortu->token_perangkat ?? [],
                        '🚪 Anak Keluar Sekolah',
                        "{$namaAnak} baru saja tervalidasi keluar gerbang.",
                        ['ticket_id' => $ticket->id_tiket_dispensasi, 'type' => 'qr_validated'],
                        [$ortu->id_pengguna]
                    );
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal kirim notifikasi validasi QR ke siswa/orang tua: ' . $e->getMessage());
        }

        return response()->json(['valid' => true, 'message' => 'Izin Sah. Siswa divalidasi untuk keluar.', 'data' => $ticket]);
    }




    public function getDailyLog(Request $request)
    {
        $startOfDay = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        $logs = \App\Models\DispensasiTicket::with(['siswa', 'scanner'])
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereIn('status', ['approved_final', 'completed_exit'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'date' => now()->format('Y-m-d'),
            'total' => $logs->count(),
            'scanned_count' => $logs->where('sudah_dipindai', true)->count(),
            'data' => $logs
        ]);
    }
}
