<?php
use App\Models\User;
use App\Models\Kelas;
use App\Models\SiswaProfile;
use Illuminate\Support\Facades\Hash;

// Cleanup existing test data (order matters for FK)
Kelas::where('nama_kelas', 'XII IPA 1')->delete();
User::whereIn('email', ['wali@test.com', 'ortu@test.com', 'siswa@test.com', 'piket@test.com'])->delete();

// Create Wali Kelas
$wali = User::create([
    'name' => 'Wali Kelas Test',
    'email' => 'wali@test.com',
    'password' => Hash::make('password'),
    'role' => 'wali_kelas'
]);

// Create Kelas
$kelas = Kelas::create([
    'nama_kelas' => 'XII IPA 1',
    'tingkat' => '12',
    'wali_kelas_id' => $wali->id
]);

// Create Orang Tua
$ortu = User::create([
    'name' => 'Orang Tua Test',
    'email' => 'ortu@test.com',
    'password' => Hash::make('password'),
    'role' => 'orang_tua'
]);

// Create Siswa
$siswaUser = User::create([
    'name' => 'Siswa Test',
    'email' => 'siswa@test.com',
    'password' => Hash::make('password'),
    'role' => 'siswa'
]);

SiswaProfile::create([
    'user_id' => $siswaUser->id,
    'kelas_id' => $kelas->id,
    'orang_tua_id' => $ortu->id,
    'nis' => '1234567890'
]);

// Create Guru Piket
$piket = User::create([
    'name' => 'Guru Piket Test',
    'email' => 'piket@test.com',
    'password' => Hash::make('password'),
    'role' => 'guru_piket'
]);

echo "Test Data Created Successfully\n";
