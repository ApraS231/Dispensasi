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
            'nama' => 'Administrator SISPensi',
            'email' => 'admin@sispensi.com',
            'password' => $password,
            'peran' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Guru Piket
        $piket1 = User::create([
            'nama' => 'Budi Santoso, S.Pd.',
            'email' => 'piket1@sispensi.com',
            'password' => $password,
            'peran' => 'guru_piket',
            'email_verified_at' => now(),
        ]);

        $piket2 = User::create([
            'nama' => 'Dewi Lestari, M.Pd.',
            'email' => 'piket2@sispensi.com',
            'password' => $password,
            'peran' => 'guru_piket',
            'email_verified_at' => now(),
        ]);

        // Parents
        $parent1 = User::create([
            'nama' => 'Hendra Wijaya (Wali Siswa)',
            'email' => 'parent1@sispensi.com',
            'password' => $password,
            'peran' => 'orang_tua',
            'email_verified_at' => now(),
        ]);

        $parent2 = User::create([
            'nama' => 'Rina Amalia (Wali Siswa)',
            'email' => 'parent2@sispensi.com',
            'password' => $password,
            'peran' => 'orang_tua',
            'email_verified_at' => now(),
        ]);

        // 2. Seed Kelas, Wali Kelas, and Siswa Profiles
        $tingkatList = [
            'X' => ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            'XI' => ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            'XII' => ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        ];

        $waliNames = [
            'X' => [
                'A' => 'Drs. H. Ahmad Fauzi',
                'B' => 'Siti Aminah, S.Pd.',
                'C' => 'H. Bambang Subianto, M.Pd.',
                'D' => 'Dra. Sri Wahyuni',
                'E' => 'Rudi Hermawan, S.Pd.',
                'F' => 'Indah Lestari, S.Pd.',
                'G' => 'Drs. M. Yusuf'
            ],
            'XI' => [
                'A' => 'Dr. Eko Prasetyo',
                'B' => 'Kartika Sari, S.Pd.',
                'C' => 'Drs. Joko Susilo',
                'D' => 'Tri Utami, M.Pd.',
                'E' => 'Wawan Setiawan, S.Pd.',
                'F' => 'Dewi Sartika, S.Pd.',
                'G' => 'Drs. Agus Harimurti'
            ],
            'XII' => [
                'A' => 'Hj. Ratna Sari, M.Pd.',
                'B' => 'Drs. Heri Cahyono',
                'C' => 'Rini Astuti, S.Pd.',
                'D' => 'Bambang Pamungkas, S.Pd.',
                'E' => 'Mega Utami, S.Pd.',
                'F' => 'Drs. Slamet Riyadi',
                'G' => 'Fitriani, M.Pd.'
            ]
        ];

        $studentFirstNames = ['Budi', 'Andi', 'Cici', 'Dedi', 'Evi', 'Fahri', 'Gita', 'Hadi', 'Ira', 'Joko', 'Kiki', 'Lia', 'Maman', 'Nina', 'Oki', 'Putri', 'Qori', 'Rian', 'Santi', 'Tono'];
        $studentLastNames = ['Pratama', 'Santoso', 'Wijaya', 'Lestari', 'Hidayat', 'Sari', 'Kusuma', 'Putra', 'Setiawan', 'Ningsih', 'Gunawan', 'Astuti', 'Wibowo', 'Fitri', 'Siregar', 'Hadi', 'Saputra', 'Ramadhan', 'Utami', 'Yusuf'];

        $testStudent1 = null;
        $testStudent2 = null;
        $testStudent3 = null;
        $testStudent4 = null;
        $testStudent5 = null;
        
        $testKelas1 = null;
        $testKelas2 = null;

        $testWali1 = null;
        $testWali2 = null;

        $nisCounter = 102030001;

        foreach ($tingkatList as $tingkat => $classes) {
            foreach ($classes as $classSuffix) {
                // Create Wali Kelas
                $waliName = $waliNames[$tingkat][$classSuffix] ?? "Wali Kelas $tingkat $classSuffix";
                $waliEmail = strtolower("wali." . $tingkat . "." . $classSuffix . "@sispensi.com");
                
                $wali = User::create([
                    'nama' => $waliName,
                    'email' => $waliEmail,
                    'password' => $password,
                    'peran' => 'wali_kelas',
                    'email_verified_at' => now(),
                ]);

                // Create Kelas
                $kelasName = "$tingkat $classSuffix";
                $kelas = Kelas::create([
                    'nama_kelas' => $kelasName,
                    'tingkat' => $tingkat,
                    'id_wali_kelas' => $wali->id_pengguna,
                ]);

                // Keep test classes/walis references
                if ($tingkat === 'XII' && $classSuffix === 'A') {
                    $testKelas1 = $kelas;
                    $testWali1 = $wali;
                }
                if ($tingkat === 'XII' && $classSuffix === 'B') {
                    $testKelas2 = $kelas;
                    $testWali2 = $wali;
                }

                // Create 5 students for this class
                for ($s = 1; $s <= 5; $s++) {
                    $fName = $studentFirstNames[array_rand($studentFirstNames)];
                    $lName = $studentLastNames[array_rand($studentLastNames)];
                    $studentName = "$fName $lName";
                    $studentEmail = strtolower($fName . "." . $lName . "." . $nisCounter . "@sispensi.com");

                    $student = User::create([
                        'nama' => $studentName,
                        'email' => $studentEmail,
                        'password' => $password,
                        'peran' => 'siswa',
                        'email_verified_at' => now(),
                    ]);

                    // Determine parent (use parent1/2 for first few, generate dynamic for others)
                    $parent = null;
                    if ($nisCounter % 5 === 1) {
                        $parent = $parent1;
                    } elseif ($nisCounter % 5 === 2) {
                        $parent = $parent2;
                    } else {
                        $parentName = "Wali dari " . $studentName;
                        $parentEmail = strtolower("ortu." . $fName . "." . $lName . "." . $nisCounter . "@sispensi.com");
                        $parent = User::create([
                            'nama' => $parentName,
                            'email' => $parentEmail,
                            'password' => $password,
                            'peran' => 'orang_tua',
                            'email_verified_at' => now(),
                        ]);
                    }

                    $idKelasForProfile = $kelas->id_kelas;

                    // Keep references for Ticket generation Compatibility
                    if ($tingkat === 'XII' && $classSuffix === 'A' && $s === 1) {
                        $testStudent1 = $student;
                    }
                    if ($tingkat === 'XII' && $classSuffix === 'A' && $s === 2) {
                        $testStudent2 = $student;
                    }
                    if ($tingkat === 'XII' && $classSuffix === 'B' && $s === 3) {
                        $testStudent3 = $student;
                    }
                    if ($tingkat === 'XII' && $classSuffix === 'B' && $s === 4) {
                        $testStudent4 = $student;
                    }
                    if ($tingkat === 'XII' && $classSuffix === 'B' && $s === 5) {
                        $testStudent5 = $student;
                        // To keep join requests working like the original seeder, set id_kelas to null
                        $idKelasForProfile = null;
                    }

                    SiswaProfile::create([
                        'id_pengguna' => $student->id_pengguna,
                        'nis' => (string)$nisCounter,
                        'id_kelas' => $idKelasForProfile,
                        'id_orang_tua' => $parent->id_pengguna,
                    ]);

                    $nisCounter++;
                }
            }
        }

        // Map compatibility variables
        $siswaUsers = [
            1 => $testStudent1,
            2 => $testStudent2,
            3 => $testStudent3,
            4 => $testStudent4,
            5 => $testStudent5,
        ];

        $kelas1 = $testKelas1;
        $kelas2 = $testKelas2;
        $wali1 = $testWali1;
        $wali2 = $testWali2;

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
