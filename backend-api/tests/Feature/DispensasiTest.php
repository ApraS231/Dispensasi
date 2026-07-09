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
}
