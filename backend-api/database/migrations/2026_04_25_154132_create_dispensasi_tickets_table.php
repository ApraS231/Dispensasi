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
        Schema::create('dispensasi_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('siswa_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('kelas_id')->constrained('kelas')->onDelete('restrict');
            $table->foreignUuid('wali_kelas_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignUuid('guru_piket_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignUuid('piket_attendance_id')->nullable()->constrained('piket_attendance_logs')->onDelete('set null');
            $table->enum('jenis_izin', ['sakit', 'keperluan_keluarga', 'lainnya'])->default('sakit');
            $table->text('alasan');
            $table->string('lampiran_bukti')->nullable();
            $table->dateTime('waktu_mulai');
            $table->dateTime('waktu_selesai');
            $table->enum('status', ['pending', 'waiting_piket', 'approved_by_wali', 'approved_by_piket', 'approved_final', 'completed_exit', 'rejected'])->default('pending');
            $table->text('catatan_penolakan')->nullable();
            $table->string('qr_code_token')->nullable()->unique();
            $table->uuid('qr_token')->nullable()->unique();
            $table->dateTime('scanned_at')->nullable();
            $table->foreignUuid('scanner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispensasi_tickets');
    }
};
