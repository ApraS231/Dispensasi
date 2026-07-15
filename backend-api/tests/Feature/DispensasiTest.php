<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\SiswaProfile;
use App\Models\Kelas;
use App\Models\DispensasiTicket;

class DispensasiTest extends TestCase
{
    use RefreshDatabase;

    public function test_prevent_multiple_dispensasi_requests_same_day()
    {
        $user = User::factory()->create(['peran' => 'siswa']);
        $kelas = Kelas::create(['nama_kelas' => '10A', 'tingkat' => '10']);
        SiswaProfile::create(['id_pengguna' => $user->id_pengguna, 'id_kelas' => $kelas->id_kelas, 'nis' => '12345']);

        $this->actingAs($user);

        // First request should succeed
        $response = $this->postJson('/api/dispensasi', [
            'jenis_izin' => 'sakit',
            'alasan' => 'Demam',
            'waktu_mulai' => now()->toDateTimeString(),
            'waktu_selesai' => now()->addDay()->toDateTimeString(),
        ]);

        $response->assertStatus(201);

        // Second request on the same day should fail
        $response2 = $this->postJson('/api/dispensasi', [
            'jenis_izin' => 'izin',
            'alasan' => 'Acara keluarga',
            'waktu_mulai' => now()->toDateTimeString(),
            'waktu_selesai' => now()->addDay()->toDateTimeString(),
        ]);

        $response2->assertStatus(400);
        $this->assertStringContainsString('Anda hanya dapat mengajukan 1 dispensasi setiap 12 jam', $response2->json('message'));
    }

    public function test_export_pdf_returns_pdf()
    {
        $user = User::factory()->create(['peran' => 'wali_kelas']);
        $kelas = Kelas::create(['nama_kelas' => '10A', 'tingkat' => '10', 'id_wali_kelas' => $user->id_pengguna]);
        
        $this->actingAs($user);
        
        $response = $this->get('/api/wali/laporan-izin/pdf?bulan=7&tahun=2026');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_reject_ticket_successfully()
    {
        $waliKelas = User::factory()->create(['peran' => 'wali_kelas']);
        $siswa = User::factory()->create(['peran' => 'siswa']);
        $kelas = Kelas::create(['nama_kelas' => '10A', 'tingkat' => '10', 'id_wali_kelas' => $waliKelas->id_pengguna]);
        $profile = SiswaProfile::create(['id_pengguna' => $siswa->id_pengguna, 'id_kelas' => $kelas->id_kelas, 'nis' => '12345']);

        $ticket = DispensasiTicket::create([
            'id_siswa' => $siswa->id_pengguna,
            'id_kelas' => $kelas->id_kelas,
            'id_wali_kelas' => $waliKelas->id_pengguna,
            'jenis_izin' => 'izin',
            'alasan' => 'Ada acara',
            'waktu_mulai' => now()->toDateTimeString(),
            'waktu_selesai' => now()->addHours(2)->toDateTimeString(),
            'status' => 'pending'
        ]);

        $this->actingAs($waliKelas);

        $response = $this->postJson("/api/dispensasi/{$ticket->id_tiket_dispensasi}/reject", [
            'catatan_penolakan' => 'Alasan kurang jelas'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('rejected', $ticket->fresh()->status);
    }
}
