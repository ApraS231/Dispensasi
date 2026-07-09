<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kelas;
use App\Models\SiswaProfile;
use App\Models\PiketSchedule;
use App\Models\PiketAttendanceLog;
use App\Models\DispensasiTicket;
use App\Models\TicketChat;
use App\Models\Notification;
use App\Models\ParentLinkRequest;
use App\Models\ClassJoinRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Seed Users
        // Admin
        $admin = User::create([
            'nama' => 'Administrator SIDISpen',
            'email' => 'admin@sidispen.com',
            'password' => $password,
            'peran' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Wali Kelas
        $wali1 = User::create([
            'nama' => 'Drs. H. Ahmad Fauzi',
            'email' => 'wali1@sidispen.com',
            'password' => $password,
            'peran' => 'wali_kelas',
            'email_verified_at' => now(),
        ]);

        $wali2 = User::create([
            'nama' => 'Siti Aminah, S.Pd.',
            'email' => 'wali2@sidispen.com',
            'password' => $password,
            'peran' => 'wali_kelas',
            'email_verified_at' => now(),
        ]);

        // Guru Piket
        $piket1 = User::create([
            'nama' => 'Budi Santoso, S.Pd.',
            'email' => 'piket1@sidispen.com',
            'password' => $password,
            'peran' => 'guru_piket',
            'email_verified_at' => now(),
        ]);

        $piket2 = User::create([
            'nama' => 'Dewi Lestari, M.Pd.',
            'email' => 'piket2@sidispen.com',
            'password' => $password,
            'peran' => 'guru_piket',
            'email_verified_at' => now(),
        ]);

        // Parents
        $parent1 = User::create([
            'nama' => 'Hendra Wijaya (Wali Siswa)',
            'email' => 'parent1@sidispen.com',
            'password' => $password,
            'peran' => 'orang_tua',
            'email_verified_at' => now(),
        ]);

        $parent2 = User::create([
            'nama' => 'Rina Amalia (Wali Siswa)',
            'email' => 'parent2@sidispen.com',
            'password' => $password,
            'peran' => 'orang_tua',
            'email_verified_at' => now(),
        ]);

        // Students
        $siswaNames = [1 => 'Budi', 2 => 'Andi', 3 => 'Cici', 4 => 'Dedi', 5 => 'Evi'];
        $siswaUsers = [];
        for ($i = 1; $i <= 5; $i++) {
            $siswaUsers[$i] = User::create([
                'nama' => "Siswa Ke-$i " . ($siswaNames[$i] ?? 'Siswa'),
                'email' => "siswa$i@sidispen.com",
                'password' => $password,
                'peran' => 'siswa',
                'email_verified_at' => now(),
            ]);
        }

        // 2. Seed Kelas
        $kelas1 = Kelas::create([
            'nama_kelas' => 'XII IPA 1',
            'tingkat' => '12',
            'id_wali_kelas' => $wali1->id_pengguna,
        ]);

        $kelas2 = Kelas::create([
            'nama_kelas' => 'XII IPS 1',
            'tingkat' => '12',
            'id_wali_kelas' => $wali2->id_pengguna,
        ]);

        // 3. Seed Siswa Profiles
        // siswa1 & siswa2 -> kelas1, parent1
        $profile1 = SiswaProfile::create([
            'id_pengguna' => $siswaUsers[1]->id_pengguna,
            'nis' => '102030401',
            'id_kelas' => $kelas1->id_kelas,
            'id_orang_tua' => $parent1->id_pengguna,
        ]);

        $profile2 = SiswaProfile::create([
            'id_pengguna' => $siswaUsers[2]->id_pengguna,
            'nis' => '102030402',
            'id_kelas' => $kelas1->id_kelas,
            'id_orang_tua' => $parent1->id_pengguna,
        ]);

        // siswa3 & siswa4 -> kelas2, parent2
        $profile3 = SiswaProfile::create([
            'id_pengguna' => $siswaUsers[3]->id_pengguna,
            'nis' => '102030403',
            'id_kelas' => $kelas2->id_kelas,
            'id_orang_tua' => $parent2->id_pengguna,
        ]);

        $profile4 = SiswaProfile::create([
            'id_pengguna' => $siswaUsers[4]->id_pengguna,
            'nis' => '102030404',
            'id_kelas' => $kelas2->id_kelas,
            'id_orang_tua' => $parent2->id_pengguna,
        ]);

        // siswa5 -> no kelas, parent1
        $profile5 = SiswaProfile::create([
            'id_pengguna' => $siswaUsers[5]->id_pengguna,
            'nis' => '102030405',
            'id_kelas' => null,
            'id_orang_tua' => $parent1->id_pengguna,
        ]);

        // 4. Seed Piket Schedules
        PiketSchedule::create([
            'id_guru' => $piket1->id_pengguna,
            'hari' => 'Senin',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        PiketSchedule::create([
            'id_guru' => $piket1->id_pengguna,
            'hari' => 'Rabu',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        PiketSchedule::create([
            'id_guru' => $piket2->id_pengguna,
            'hari' => 'Selasa',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        PiketSchedule::create([
            'id_guru' => $piket2->id_pengguna,
            'hari' => 'Kamis',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        // 5. Seed Piket Attendance Logs
        $attendanceLog = PiketAttendanceLog::create([
            'id_guru' => $piket1->id_pengguna,
            'waktu_masuk' => now()->subHours(4),
            'waktu_keluar' => null,
            'status_aktif' => true,
        ]);

        // 6. Seed Dispensasi Tickets
        // Ticket 1: Pending (Siswa 1)
        $ticket1 = DispensasiTicket::create([
            'id_siswa' => $siswaUsers[1]->id_pengguna,
            'id_kelas' => $kelas1->id_kelas,
            'id_wali_kelas' => $wali1->id_pengguna,
            'id_guru_piket' => null,
            'id_log_kehadiran_piket' => null,
            'jenis_izin' => 'sakit',
            'alasan' => 'Demam tinggi dan pusing sejak semalam',
            'lampiran_bukti' => null,
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addHours(6),
            'status' => 'pending',
            'catatan_penolakan' => null,
            'token_qr_code' => null,
            'token_qr' => null,
            'sudah_dipindai' => false,
        ]);

        // Ticket 2: Approved by Wali (Siswa 2)
        $ticket2 = DispensasiTicket::create([
            'id_siswa' => $siswaUsers[2]->id_pengguna,
            'id_kelas' => $kelas1->id_kelas,
            'id_wali_kelas' => $wali1->id_pengguna,
            'id_guru_piket' => null,
            'id_log_kehadiran_piket' => null,
            'jenis_izin' => 'izin',
            'alasan' => 'Menghadiri acara pernikahan kakak kandung',
            'lampiran_bukti' => null,
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addHours(4),
            'status' => 'waiting_piket',
            'catatan_penolakan' => null,
            'token_qr_code' => Str::random(16),
            'token_qr' => Str::uuid(),
            'sudah_dipindai' => false,
        ]);

        // Ticket 3: Approved Final (Siswa 3)
        $ticket3 = DispensasiTicket::create([
            'id_siswa' => $siswaUsers[3]->id_pengguna,
            'id_kelas' => $kelas2->id_kelas,
            'id_wali_kelas' => $wali2->id_pengguna,
            'id_guru_piket' => $piket1->id_pengguna,
            'id_log_kehadiran_piket' => $attendanceLog->id_log_kehadiran_piket,
            'jenis_izin' => 'dispensasi',
            'alasan' => 'Mewakili sekolah mengikuti lomba olimpiade matematika',
            'lampiran_bukti' => null,
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addHours(8),
            'status' => 'approved_final',
            'catatan_penolakan' => null,
            'token_qr_code' => Str::random(16),
            'token_qr' => Str::uuid(),
            'sudah_dipindai' => false,
            'kedaluwarsa_pada' => now()->addHours(8),
        ]);

        // Ticket 4: Completed Exit (Siswa 4)
        $ticket4 = DispensasiTicket::create([
            'id_siswa' => $siswaUsers[4]->id_pengguna,
            'id_kelas' => $kelas2->id_kelas,
            'id_wali_kelas' => $wali2->id_pengguna,
            'id_guru_piket' => $piket2->id_pengguna,
            'id_log_kehadiran_piket' => null,
            'jenis_izin' => 'sakit',
            'alasan' => 'Tiba-tiba sakit perut melilit saat jam pelajaran',
            'lampiran_bukti' => null,
            'waktu_mulai' => now()->subHours(2),
            'waktu_selesai' => now()->addHours(2),
            'status' => 'completed_exit',
            'catatan_penolakan' => null,
            'token_qr_code' => Str::random(16),
            'token_qr' => Str::uuid(),
            'sudah_dipindai' => true,
            'waktu_pindai' => now()->subMinutes(30),
            'id_pemindai' => $piket2->id_pengguna,
            'kedaluwarsa_pada' => now()->addHours(2),
        ]);

        // 7. Seed Ticket Chats
        TicketChat::create([
            'id_tiket_dispensasi' => $ticket1->id_tiket_dispensasi,
            'id_pengirim' => $siswaUsers[1]->id_pengguna,
            'pesan' => 'Assalamualaikum pak, mohon izin saya hari ini mengajukan izin sakit karena demam.',
            'sudah_dibaca' => true,
        ]);

        TicketChat::create([
            'id_tiket_dispensasi' => $ticket1->id_tiket_dispensasi,
            'id_pengirim' => $wali1->id_pengguna,
            'pesan' => 'Waalaikumsalam, baik nak. Segera upload surat keterangan dokter atau bukti sakitnya ya agar bapak setujui.',
            'sudah_dibaca' => false,
        ]);

        // 8. Seed Notifications
        Notification::create([
            'id_pengguna' => $wali1->id_pengguna,
            'judul' => 'Pengajuan Dispensasi Baru',
            'isi' => $siswaUsers[1]->nama . ' mengajukan izin sakit.',
            'tipe' => 'ticket_created',
            'id_referensi' => $ticket1->id_tiket_dispensasi,
            'sudah_dibaca' => false,
        ]);

        Notification::create([
            'id_pengguna' => $siswaUsers[2]->id_pengguna,
            'judul' => 'Dispensasi Disetujui Wali Kelas',
            'isi' => 'Pengajuan izin Anda telah disetujui oleh wali kelas dan menunggu konfirmasi guru piket.',
            'tipe' => 'ticket_approved_wali',
            'id_referensi' => $ticket2->id_tiket_dispensasi,
            'sudah_dibaca' => true,
        ]);

        // 9. Seed Parent Link Requests
        // Request from parent1 to siswa5 (pending link)
        ParentLinkRequest::create([
            'id_orang_tua' => $parent1->id_pengguna,
            'id_siswa' => $siswaUsers[5]->id_pengguna,
            'status' => 'pending',
        ]);

        // 10. Seed Class Join Requests
        // Request from siswa5 to join kelas1
        ClassJoinRequest::create([
            'id_siswa' => $siswaUsers[5]->id_pengguna,
            'id_kelas' => $kelas1->id_kelas,
            'status' => 'pending',
        ]);
    }
}
