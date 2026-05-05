<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PiketSchedule;
use App\Models\User;

$guru = User::where('role', 'guru_piket')->first();

if (!$guru) {
    echo "No Guru Piket found!\n";
    exit(1);
}

foreach (range(1, 7) as $day) {
    PiketSchedule::create([
        'guru_id' => $guru->id,
        'hari' => $day,
        'jam_mulai' => '00:00:00',
        'jam_selesai' => '23:59:59'
    ]);
}

echo "Created 7 schedules for {$guru->name}\n";
