<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = User::where('email', 'admin@sekolah.com')->first();
if ($user) {
    $user->password = Hash::make('password');
    $user->save();
    echo "Password updated successfully for admin@sekolah.com\n";
} else {
    echo "Admin user not found\n";
}
