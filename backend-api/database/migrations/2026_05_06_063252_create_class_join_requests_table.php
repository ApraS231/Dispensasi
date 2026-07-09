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
        Schema::create('permintaan_gabung_kelas', function (Blueprint $table) {
            $table->uuid('id_permintaan_gabung_kelas')->primary();
            $table->foreignUuid('id_siswa')->constrained('pengguna', 'id_pengguna')->onDelete('cascade');
            $table->foreignUuid('id_kelas')->constrained('kelas', 'id_kelas')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permintaan_gabung_kelas');
    }
};
