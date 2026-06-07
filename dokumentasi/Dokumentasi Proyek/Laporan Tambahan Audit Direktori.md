# Dokumentasi Tambahan: Penyelesaian Halaman Navigasi (Bottom Tab Bar)

Dokumen ini melengkapi `Dokumentasi UI_UX SiDispen.md` untuk mencatat penambahan 8 halaman (layar) yang secara fungsional diperlukan untuk melengkapi ekosistem navigasi pada *Bottom Tab Bar*, namun sebelumnya belum didefinisikan secara eksplisit.

## Penambahan Layar Baru Berdasarkan Role

### 1. Role: Siswa
- **`(siswa)/riwayat.tsx`**: Layar untuk melihat keseluruhan riwayat pengajuan izin yang pernah dilakukan siswa. Terdiri dari *Search Bar*, filter status (*Pills*), dan daftar riwayat menggunakan komponen `TicketCard`. 

### 2. Role: Guru Piket
- **`(piket)/queue.tsx` (Antrean)**: Layar spesifik untuk melihat daftar siswa yang sedang menunggu izin keluar gerbang (*pending* atau *approved_by_wali*). Memisahkan fokus dari dasbor analitik utama ke layar operasional.
- **`(piket)/history.tsx` (Riwayat)**: Menampilkan data tiket dispensasi masa lalu (*approved_final* atau *rejected*) untuk keperluan audit harian/mingguan.
- **`(piket)/profile.tsx` (Profil)**: Layar profil khusus untuk Guru Piket dengan opsi *Pengaturan Akun*, *Ubah Password*, dan ringkasan identitas staf.

### 3. Role: Wali Kelas
- **`(wali)/queue.tsx` (Antrean)**: Memungkinkan wali kelas berfokus hanya pada daftar pengajuan izin dari siswa di kelasnya yang butuh persetujuan (*pending*).
- **`(wali)/history.tsx` (Riwayat)**: Melihat rekam jejak persetujuan/penolakan yang telah berlalu untuk seluruh anggota kelasnya.
- **`(wali)/profile.tsx` (Profil)**: Layar profil khusus untuk Wali Kelas.

### 4. Role: Orang Tua
- **`(ortu)/profile.tsx` (Profil)**: Mengakomodasi pengaturan profil Orang Tua, dan dilengkapi tombol aksi spesifik seperti *"Kelola Data Anak"* dan *"Unduh Laporan Semester"*.

## Kesimpulan Estetika & UX
Semua halaman tambahan ini tidak menyimpang dari filosofi desain aslinya.
- Penggunaan `TopAppBar` tanpa avatar memastikan hierarki navigasi antar-layar yang konsisten.
- Integrasi murni dengan `BottomTabBar` menjadikan transisi antar menu (Dashboard -> Queue -> History -> Profile) terasa instan tanpa membebani otak pengguna.
- Semua desain mematuhi palet warna *Golden Ratio* dan efek *Glassmorphism* yang sebelumnya telah terbangun di Fase 1 hingga Fase 5.
