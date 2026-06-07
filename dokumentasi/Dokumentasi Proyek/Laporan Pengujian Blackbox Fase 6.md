# Laporan Pengujian Blackbox (Fase 6) - SiDispen

Laporan ini merinci hasil pengujian *End-to-End* (E2E) pada sistem SiDispen melalui simulasi API untuk memverifikasi fungsionalitas utama.

---

## 🛠️ Ringkasan Pengujian

- **Tanggal Pengujian:** 2026-04-26
- **Metode:** Simulasi API (Blackbox) via Skrip Otomatis
- **Lingkungan:** Lokal (Laravel Development Server)
- **Status Akhir:** ✅ **PASSED**

---

## 📋 Detail Skenario & Hasil

| No | Skenario Pengujian | Langkah | Hasil Diharapkan | Status |
|---|---|---|---|---|
| 1 | **Autentikasi (Siswa)** | Login dengan email `siswa@test.com` | Mendapatkan token Sanctum | ✅ PASSED |
| 2 | **Autentikasi (Piket)** | Login dengan email `piket@test.com` | Mendapatkan token Sanctum | ✅ PASSED |
| 3 | **Piket Ready** | Guru Piket menekan tombol "Set Ready" | `PiketAttendanceLog` aktif tercipta | ✅ PASSED |
| 4 | **Pengajuan Tiket** | Siswa mengirim data dispensasi | Tiket tersimpan dengan status `pending` | ✅ PASSED |
| 5 | **Auto-Assignment** | Sistem memproses tiket baru | `wali_kelas_id` & `guru_piket_id` terisi otomatis | ✅ PASSED |
| 6 | **Approval Wali Kelas** | Wali Kelas menyetujui tiket | Status berubah ke `approved_by_wali` | ✅ PASSED |
| 7 | **Approval Final (Piket)** | Guru Piket menyetujui tiket | Status: `approved_final` + QR Token terisi | ✅ PASSED |
| 8 | **Monitoring (Ortu)** | Orang Tua login & cek daftar anak | Menampilkan riwayat dispensasi anak terkait | ✅ PASSED |

---

## 🔍 Temuan Teknis Selama Pengujian
- **Urutan Operasi:** Ditemukan bahwa Guru Piket harus dalam status **"Ready"** (Checkout belum dilakukan) agar sistem auto-assignment dapat menemukan petugas piket yang tersedia saat siswa mengajukan izin. Ini sesuai dengan logika bisnis yang dirancang.
- **Konsistensi Data:** Seluruh UUID dan relasi antar tabel (Siswa -> Kelas -> Wali) berfungsi dengan sinkron.

---

## ✅ Kesimpulan
Sistem **SiDispen** telah melewati pengujian fungsionalitas utama dengan sukses. Alur kerja dari pengajuan hingga persetujuan akhir dan pembuatan QR Code telah divalidasi melalui simulasi API.

Sistem siap dilanjutkan ke **Fase 7: Deployment & Cutover**.
