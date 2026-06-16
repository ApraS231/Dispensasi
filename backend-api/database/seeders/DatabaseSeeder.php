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
            'name' => 'Administrator SIDISpen',
            'email' => 'admin@sidispen.com',
            'password' => $password,
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Wali Kelas
        $wali1 = User::create([
            'name' => 'Drs. H. Ahmad Fauzi',
            'email' => 'wali1@sidispen.com',
            'password' => $password,
            'role' => 'wali_kelas',
            'email_verified_at' => now(),
        ]);

        $wali2 = User::create([
            'name' => 'Siti Aminah, S.Pd.',
            'email' => 'wali2@sidispen.com',
            'password' => $password,
            'role' => 'wali_kelas',
            'email_verified_at' => now(),
        ]);

        // Guru Piket
        $piket1 = User::create([
            'name' => 'Budi Santoso, S.Pd.',
            'email' => 'piket1@sidispen.com',
            'password' => $password,
            'role' => 'guru_piket',
            'email_verified_at' => now(),
        ]);

        $piket2 = User::create([
            'name' => 'Dewi Lestari, M.Pd.',
            'email' => 'piket2@sidispen.com',
            'password' => $password,
            'role' => 'guru_piket',
            'email_verified_at' => now(),
        ]);

        // Parents
        $parent1 = User::create([
            'name' => 'Hendra Wijaya (Wali Siswa)',
            'email' => 'parent1@sidispen.com',
            'password' => $password,
            'role' => 'orang_tua',
            'email_verified_at' => now(),
        ]);

        $parent2 = User::create([
            'name' => 'Rina Amalia (Wali Siswa)',
            'email' => 'parent2@sidispen.com',
            'password' => $password,
            'role' => 'orang_tua',
            'email_verified_at' => now(),
        ]);

        // Students
        $siswaNames = [1 => 'Budi', 2 => 'Andi', 3 => 'Cici', 4 => 'Dedi', 5 => 'Evi'];
        $siswaUsers = [];
        for ($i = 1; $i <= 5; $i++) {
            $siswaUsers[$i] = User::create([
                'name' => "Siswa Ke-$i " . ($siswaNames[$i] ?? 'Siswa'),
                'email' => "siswa$i@sidispen.com",
                'password' => $password,
                'role' => 'siswa',
                'email_verified_at' => now(),
            ]);
        }

        // 2. Seed Kelas
        $kelas1 = Kelas::create([
            'nama_kelas' => 'XII IPA 1',
            'tingkat' => '12',
            'wali_kelas_id' => $wali1->id,
        ]);

        $kelas2 = Kelas::create([
            'nama_kelas' => 'XII IPS 1',
            'tingkat' => '12',
            'wali_kelas_id' => $wali2->id,
        ]);

        // 3. Seed Siswa Profiles
        // siswa1 & siswa2 -> kelas1, parent1
        $profile1 = SiswaProfile::create([
            'user_id' => $siswaUsers[1]->id,
            'nis' => '102030401',
            'kelas_id' => $kelas1->id,
            'orang_tua_id' => $parent1->id,
        ]);

        $profile2 = SiswaProfile::create([
            'user_id' => $siswaUsers[2]->id,
            'nis' => '102030402',
            'kelas_id' => $kelas1->id,
            'orang_tua_id' => $parent1->id,
        ]);

        // siswa3 & siswa4 -> kelas2, parent2
        $profile3 = SiswaProfile::create([
            'user_id' => $siswaUsers[3]->id,
            'nis' => '102030403',
            'kelas_id' => $kelas2->id,
            'orang_tua_id' => $parent2->id,
        ]);

        $profile4 = SiswaProfile::create([
            'user_id' => $siswaUsers[4]->id,
            'nis' => '102030404',
            'kelas_id' => $kelas2->id,
            'orang_tua_id' => $parent2->id,
        ]);

        // siswa5 -> no kelas, parent1
        $profile5 = SiswaProfile::create([
            'user_id' => $siswaUsers[5]->id,
            'nis' => '102030405',
            'kelas_id' => null,
            'orang_tua_id' => $parent1->id,
        ]);

        // 4. Seed Piket Schedules
        PiketSchedule::create([
            'guru_id' => $piket1->id,
            'hari' => 'Senin',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        PiketSchedule::create([
            'guru_id' => $piket1->id,
            'hari' => 'Rabu',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        PiketSchedule::create([
            'guru_id' => $piket2->id,
            'hari' => 'Selasa',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        PiketSchedule::create([
            'guru_id' => $piket2->id,
            'hari' => 'Kamis',
            'jam_mulai' => '07:00:00',
            'jam_selesai' => '14:00:00',
        ]);

        // 5. Seed Piket Attendance Logs
        $attendanceLog = PiketAttendanceLog::create([
            'guru_id' => $piket1->id,
            'waktu_masuk' => now()->subHours(4),
            'waktu_keluar' => null,
            'status_aktif' => true,
        ]);

        // 6. Seed Dispensasi Tickets
        // Ticket 1: Pending (Siswa 1)
        $ticket1 = DispensasiTicket::create([
            'siswa_id' => $siswaUsers[1]->id,
            'kelas_id' => $kelas1->id,
            'wali_kelas_id' => $wali1->id,
            'guru_piket_id' => null,
            'piket_attendance_id' => null,
            'jenis_izin' => 'sakit',
            'alasan' => 'Demam tinggi dan pusing sejak semalam',
            'lampiran_bukti' => null,
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addHours(6),
            'status' => 'pending',
            'catatan_penolakan' => null,
            'qr_code_token' => null,
            'qr_token' => null,
            'is_scanned' => false,
        ]);

        // Ticket 2: Approved by Wali (Siswa 2)
        $ticket2 = DispensasiTicket::create([
            'siswa_id' => $siswaUsers[2]->id,
            'kelas_id' => $kelas1->id,
            'wali_kelas_id' => $wali1->id,
            'guru_piket_id' => null,
            'piket_attendance_id' => null,
            'jenis_izin' => 'izin',
            'alasan' => 'Menghadiri acara pernikahan kakak kandung',
            'lampiran_bukti' => null,
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addHours(4),
            'status' => 'waiting_piket',
            'catatan_penolakan' => null,
            'qr_code_token' => Str::random(16),
            'qr_token' => Str::uuid(),
            'is_scanned' => false,
        ]);

        // Ticket 3: Approved Final (Siswa 3)
        $ticket3 = DispensasiTicket::create([
            'siswa_id' => $siswaUsers[3]->id,
            'kelas_id' => $kelas2->id,
            'wali_kelas_id' => $wali2->id,
            'guru_piket_id' => $piket1->id,
            'piket_attendance_id' => $attendanceLog->id,
            'jenis_izin' => 'dispensasi',
            'alasan' => 'Mewakili sekolah mengikuti lomba olimpiade matematika',
            'lampiran_bukti' => null,
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addHours(8),
            'status' => 'approved_final',
            'catatan_penolakan' => null,
            'qr_code_token' => Str::random(16),
            'qr_token' => Str::uuid(),
            'is_scanned' => false,
            'expires_at' => now()->addHours(8),
        ]);

        // Ticket 4: Completed Exit (Siswa 4)
        $ticket4 = DispensasiTicket::create([
            'siswa_id' => $siswaUsers[4]->id,
            'kelas_id' => $kelas2->id,
            'wali_kelas_id' => $wali2->id,
            'guru_piket_id' => $piket2->id,
            'piket_attendance_id' => null,
            'jenis_izin' => 'sakit',
            'alasan' => 'Tiba-tiba sakit perut melilit saat jam pelajaran',
            'lampiran_bukti' => null,
            'waktu_mulai' => now()->subHours(2),
            'waktu_selesai' => now()->addHours(2),
            'status' => 'completed_exit',
            'catatan_penolakan' => null,
            'qr_code_token' => Str::random(16),
            'qr_token' => Str::uuid(),
            'is_scanned' => true,
            'scanned_at' => now()->subMinutes(30),
            'scanner_id' => $piket2->id,
            'expires_at' => now()->addHours(2),
        ]);

        // 7. Seed Ticket Chats
        TicketChat::create([
            'dispensasi_ticket_id' => $ticket1->id,
            'sender_id' => $siswaUsers[1]->id,
            'pesan' => 'Assalamualaikum pak, mohon izin saya hari ini mengajukan izin sakit karena demam.',
            'is_read' => true,
        ]);

        TicketChat::create([
            'dispensasi_ticket_id' => $ticket1->id,
            'sender_id' => $wali1->id,
            'pesan' => 'Waalaikumsalam, baik nak. Segera upload surat keterangan dokter atau bukti sakitnya ya agar bapak setujui.',
            'is_read' => false,
        ]);

        // 8. Seed Notifications
        Notification::create([
            'user_id' => $wali1->id,
            'title' => 'Pengajuan Dispensasi Baru',
            'body' => $siswaUsers[1]->name . ' mengajukan izin sakit.',
            'tipe' => 'ticket_created',
            'reference_id' => $ticket1->id,
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $siswaUsers[2]->id,
            'title' => 'Dispensasi Disetujui Wali Kelas',
            'body' => 'Pengajuan izin Anda telah disetujui oleh wali kelas dan menunggu konfirmasi guru piket.',
            'tipe' => 'ticket_approved_wali',
            'reference_id' => $ticket2->id,
            'is_read' => true,
        ]);

        // 9. Seed Parent Link Requests
        // Request from parent1 to siswa5 (pending link)
        ParentLinkRequest::create([
            'parent_id' => $parent1->id,
            'siswa_id' => $siswaUsers[5]->id,
            'status' => 'pending',
        ]);

        // 10. Seed Class Join Requests
        // Request from siswa5 to join kelas1
        ClassJoinRequest::create([
            'siswa_id' => $siswaUsers[5]->id,
            'kelas_id' => $kelas1->id,
            'status' => 'pending',
        ]);
    }
}
