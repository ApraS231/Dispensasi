<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DispensasiTicket;
use App\Models\PiketAttendanceLog;
use App\Models\SiswaProfile;
use App\Models\User;
use App\Services\ExpoPushService;
use Illuminate\Support\Str;

class DispensasiController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'jenis_izin' => 'required|in:sakit,keperluan_keluarga,lainnya',
            'alasan' => 'required|string',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'required|date',
        ]);

        $siswa = $request->user();
        $profilSiswa = SiswaProfile::where('user_id', $siswa->id)->with('kelas')->first();

        if (!$profilSiswa) {
            return response()->json(['message' => 'Profil siswa tidak ditemukan'], 400);
        }

        $waliKelasId = $profilSiswa->kelas->wali_kelas_id ?? null;

        $piketAktif = PiketAttendanceLog::where('status_aktif', true)->latest()->first();
        $guruPiketId = $piketAktif ? $piketAktif->guru_id : null;
        $piketAttendanceId = $piketAktif ? $piketAktif->id : null;

        $tiket = DispensasiTicket::create([
            'siswa_id' => $siswa->id,
            'kelas_id' => $profilSiswa->kelas_id,
            'wali_kelas_id' => $waliKelasId,
            'guru_piket_id' => $guruPiketId,
            'piket_attendance_id' => $piketAttendanceId,
            'jenis_izin' => $request->jenis_izin,
            'alasan' => $request->alasan,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_selesai' => $request->waktu_selesai,
            'status' => 'pending'
        ]);

        // Dapatkan Device Token dari Wali Kelas dan Guru Piket
        $guruTokens = User::whereIn('id', [$waliKelasId, $guruPiketId])
                          ->whereNotNull('device_token')
                          ->pluck('device_token')
                          ->toArray();

        if (!empty($guruTokens)) {
            ExpoPushService::send(
                $guruTokens,
                '⏳ Pengajuan Dispensasi Baru',
                "{$siswa->name} mengajukan izin: {$request->jenis_izin}.",
                ['ticket_id' => $tiket->id, 'type' => 'new_ticket']
            );
        }

        return response()->json(['message' => 'Tiket berhasil diajukan', 'data' => $tiket], 201);
    }

    public function approve(Request $request, $id)
    {
        $tiket = DispensasiTicket::findOrFail($id);
        $user = $request->user();

        if ($user->role === 'wali_kelas' && $tiket->wali_kelas_id === $user->id) {
            $tiket->update(['status' => 'approved_by_wali']);
        } else if ($user->role === 'guru_piket' && $tiket->guru_piket_id === $user->id) {
            $tiket->update([
                'status' => 'approved_final',
                'qr_code_token' => (string) Str::uuid()
            ]);
        } else {
            return response()->json(['message' => 'Anda tidak berhak menyetujui tiket ini'], 403);
        }

        // Kirim notifikasi ke Siswa
        if ($tiket->siswa && $tiket->siswa->device_token) {
            ExpoPushService::send(
                $tiket->siswa->device_token,
                '✅ Izin Disetujui!',
                'Izin Anda telah disetujui. Cek status selengkapnya.',
                ['ticket_id' => $tiket->id, 'type' => 'ticket_approved']
            );
        }

        // Kirim notifikasi ke Orang Tua
        $profil = SiswaProfile::where('user_id', $tiket->siswa_id)->first();
        if ($profil && $profil->orang_tua_id) {
            $ortu = User::find($profil->orang_tua_id);
            if ($ortu && $ortu->device_token) {
                ExpoPushService::send(
                    $ortu->device_token,
                    '✅ Izin Anak Anda Disetujui',
                    "Izin sekolah {$tiket->siswa->name} telah diverifikasi oleh sekolah.",
                    ['ticket_id' => $tiket->id, 'type' => 'ticket_approved']
                );
            }
        }

        return response()->json(['message' => 'Tiket disetujui', 'data' => $tiket]);
    }
    
    public function reject(Request $request, $id)
    {
        $tiket = DispensasiTicket::findOrFail($id);
        $user = $request->user();

        $request->validate(['catatan_penolakan' => 'required|string']);

        if (($user->role === 'wali_kelas' && $tiket->wali_kelas_id === $user->id) || 
            ($user->role === 'guru_piket' && $tiket->guru_piket_id === $user->id)) {
            $tiket->update([
                'status' => 'rejected',
                'catatan_penolakan' => $request->catatan_penolakan
            ]);
        } else {
            return response()->json(['message' => 'Anda tidak berhak menolak tiket ini'], 403);
        }

        return response()->json(['message' => 'Tiket ditolak', 'data' => $tiket]);
    }

    public function myTickets(Request $request)
    {
        $tickets = DispensasiTicket::where('siswa_id', $request->user()->id)->get();
        return response()->json($tickets);
    }
    
    public function monitoringAnak(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'orang_tua') return response()->json(['message' => 'Forbidden'], 403);
        
        $anakIds = SiswaProfile::where('orang_tua_id', $user->id)->pluck('user_id');
        $tickets = DispensasiTicket::whereIn('siswa_id', $anakIds)->get();
        return response()->json($tickets);
    }
}
