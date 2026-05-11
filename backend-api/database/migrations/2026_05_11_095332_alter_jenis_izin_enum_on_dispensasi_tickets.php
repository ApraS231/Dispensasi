<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Mengubah enum jenis_izin dari ['sakit', 'keperluan_keluarga', 'lainnya']
     * menjadi ['sakit', 'izin', 'dispensasi'].
     *
     * Data lama yang menggunakan 'keperluan_keluarga', 'keterangan_lain', atau
     * 'lainnya' akan di-migrate ke 'izin'.
     */
    public function up(): void
    {
        // 1. Drop constraint lama DULU agar UPDATE tidak ditolak
        DB::statement("ALTER TABLE dispensasi_tickets DROP CONSTRAINT IF EXISTS dispensasi_tickets_jenis_izin_check");

        // 2. Migrate data lama ke nilai baru
        DB::statement("UPDATE dispensasi_tickets SET jenis_izin = 'izin' WHERE jenis_izin IN ('keperluan_keluarga', 'keterangan_lain', 'lainnya')");

        // 3. Buat constraint baru dengan 3 enum
        DB::statement("ALTER TABLE dispensasi_tickets ADD CONSTRAINT dispensasi_tickets_jenis_izin_check CHECK (jenis_izin::text = ANY (ARRAY['sakit'::text, 'izin'::text, 'dispensasi'::text]))");

        // 4. Update default value
        DB::statement("ALTER TABLE dispensasi_tickets ALTER COLUMN jenis_izin SET DEFAULT 'sakit'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop constraint baru
        DB::statement("ALTER TABLE dispensasi_tickets DROP CONSTRAINT IF EXISTS dispensasi_tickets_jenis_izin_check");

        // Revert: migrate 'izin' dan 'dispensasi' kembali ke nilai lama
        DB::statement("UPDATE dispensasi_tickets SET jenis_izin = 'lainnya' WHERE jenis_izin IN ('izin', 'dispensasi')");

        // Restore constraint lama
        DB::statement("ALTER TABLE dispensasi_tickets ADD CONSTRAINT dispensasi_tickets_jenis_izin_check CHECK (jenis_izin::text = ANY (ARRAY['sakit'::text, 'keperluan_keluarga'::text, 'lainnya'::text]))");

        DB::statement("ALTER TABLE dispensasi_tickets ALTER COLUMN jenis_izin SET DEFAULT 'sakit'");
    }
};
