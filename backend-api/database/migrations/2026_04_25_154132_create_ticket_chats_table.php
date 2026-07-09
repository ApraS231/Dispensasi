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
        Schema::create('obrolan_tiket', function (Blueprint $table) {
            $table->uuid('id_obrolan_tiket')->primary();
            $table->foreignUuid('id_tiket_dispensasi')->constrained('tiket_dispensasi', 'id_tiket_dispensasi')->onDelete('cascade');
            $table->foreignUuid('id_pengirim')->constrained('pengguna', 'id_pengguna')->onDelete('cascade');
            $table->text('pesan');
            $table->boolean('sudah_dibaca')->default(false);
            $table->timestamps();
            $table->string('url_lampiran')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obrolan_tiket');
    }
};
