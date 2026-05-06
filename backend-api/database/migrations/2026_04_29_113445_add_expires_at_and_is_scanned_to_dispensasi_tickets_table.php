<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dispensasi_tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('dispensasi_tickets', 'expires_at')) {
                $table->dateTime('expires_at')->nullable();
            }
            if (!Schema::hasColumn('dispensasi_tickets', 'is_scanned')) {
                $table->boolean('is_scanned')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dispensasi_tickets', function (Blueprint $table) {
            $table->dropColumn(['expires_at', 'is_scanned']);
        });
    }
};
