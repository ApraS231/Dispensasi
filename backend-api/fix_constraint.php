<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Drop existing constraint
    DB::statement('ALTER TABLE dispensasi_tickets DROP CONSTRAINT IF EXISTS dispensasi_tickets_status_check');
    
    // Add new constraint with all required statuses
    DB::statement("ALTER TABLE dispensasi_tickets ADD CONSTRAINT dispensasi_tickets_status_check CHECK (status IN ('pending', 'waiting_piket', 'approved_by_wali', 'approved_by_piket', 'approved_final', 'completed_exit', 'rejected'))");
    
    echo "Constraint updated successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
