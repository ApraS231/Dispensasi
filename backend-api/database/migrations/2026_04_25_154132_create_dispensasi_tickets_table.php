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
        Schema::create('tiket_dispensasi', function (Blueprint $table) {
            $table->uuid('id_tiket_dispensasi')->primary();
            $table->foreignUuid('id_siswa')->constrained('pengguna', 'id_pengguna')->onDelete('cascade');
            $table->foreignUuid('id_kelas')->constrained('kelas', 'id_kelas')->onDelete('restrict');
            $table->foreignUuid('id_wali_kelas')->nullable()->constrained('pengguna', 'id_pengguna')->onDelete('set null');
            $table->foreignUuid('id_guru_piket')->nullable()->constrained('pengguna', 'id_pengguna')->onDelete('set null');
            $table->foreignUuid('id_log_kehadiran_piket')->nullable()->constrained('log_kehadiran_piket', 'id_log_kehadiran_piket')->onDelete('set null');
            $table->enum('jenis_izin', ['sakit', 'izin', 'dispensasi'])->default('sakit');
            $table->text('alasan');
            $table->string('lampiran_bukti')->nullable();
            $table->dateTime('waktu_mulai');
            $table->dateTime('waktu_selesai');
            $table->enum('status', ['pending', 'waiting_piket', 'approved_by_wali', 'approved_by_piket', 'approved_final', 'completed_exit', 'rejected'])->default('pending');
            $table->text('catatan_penolakan')->nullable();
            $table->string('token_qr_code')->nullable()->unique();
            $table->timestamps();
            $table->uuid('token_qr')->nullable()->unique();
            $table->dateTime('waktu_pindai')->nullable();
            $table->foreignUuid('id_pemindai')->nullable()->constrained('pengguna', 'id_pengguna')->onDelete('set null');
            $table->dateTime('kedaluwarsa_pada')->nullable();
            $table->boolean('sudah_dipindai')->nullable()->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tiket_dispensasi');
    }
};
