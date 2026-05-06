<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$requests = \App\Models\ParentLinkRequest::all();
foreach ($requests as $req) {
    echo "ID: " . $req->id . " | Status: " . $req->status . "\n";
}
echo "Total Requests: " . $requests->count() . "\n";
