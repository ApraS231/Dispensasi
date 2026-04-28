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
        Schema::create('piket_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guru_id')->constrained('users')->onDelete('cascade');
            $table->integer('hari_dalam_minggu'); // 1=Senin, 2=Selasa, dst
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('piket_schedules');
    }
};
