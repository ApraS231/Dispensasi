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
        Schema::create('profil_siswa', function (Blueprint $table) {
            $table->uuid('id_profil_siswa')->primary();
            $table->foreignUuid('id_pengguna')->constrained('pengguna', 'id_pengguna')->onDelete('cascade');
            $table->string('nis')->unique();
            $table->foreignUuid('id_kelas')->nullable()->constrained('kelas', 'id_kelas')->onDelete('restrict');
            $table->foreignUuid('id_orang_tua')->nullable()->constrained('pengguna', 'id_pengguna')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil_siswa');
    }
};
