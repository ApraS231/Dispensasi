<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$wali = \App\Models\User::where('role', 'wali_kelas')->first();
$kelas = \App\Models\Kelas::where('wali_kelas_id', $wali->id)->first();

echo "Wali: " . $wali->name . "\n";
echo "Kelas: " . ($kelas ? $kelas->nama_kelas : 'None') . "\n";

if ($kelas) {
    $siswa = \App\Models\SiswaProfile::where('kelas_id', $kelas->id)->get();
    echo "Jumlah Siswa di Kelas: " . $siswa->count() . "\n";
    foreach ($siswa as $s) {
        echo " - " . $s->user->name . " (" . $s->nis . ")\n";
    }

    $requests = \App\Models\ClassJoinRequest::where('kelas_id', $kelas->id)->where('status', 'pending')->get();
    echo "Jumlah Request: " . $requests->count() . "\n";
}

$allSiswa = \App\Models\User::where('role', 'siswa')->get();
echo "Total Siswa in DB: " . $allSiswa->count() . "\n";
foreach ($allSiswa as $s) {
    echo " - " . $s->name . " (Kelas ID: " . ($s->siswaProfile->kelas_id ?? 'NULL') . ")\n";
}

