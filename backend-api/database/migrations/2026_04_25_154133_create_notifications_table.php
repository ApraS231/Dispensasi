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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->uuid('id_notifikasi')->primary();
            $table->foreignUuid('id_pengguna')->constrained('pengguna', 'id_pengguna')->onDelete('cascade');
            $table->string('judul');
            $table->text('isi');
            $table->string('tipe')->nullable();
            $table->uuid('id_referensi')->nullable();
            $table->boolean('sudah_dibaca')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
