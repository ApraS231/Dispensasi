# Laporan Implementasi UI/UX SiDispen (Fase 4: Orang Tua Module)

Dokumen ini merupakan laporan teknis penyelesaian Fase 4, yang berfokus penuh pada pengalaman (UX) untuk Peran Orang Tua (*Role Ortu*). Modul ini dirombak agar fokus pada pemantauan yang mudah dicerna dan transparan.

## 1. Komponen TimelineNode (`TimelineNode.tsx`)
Komponen visual krusial ini direkayasa ulang untuk mendukung representasi visual dari "alur perjalanan tiket" (*ticket journey*).
- **Ikon Berkonteks**: Titik-titik (bead) pada linimasa kini tidak sekadar terisi warna hijau, tetapi bisa menyematkan ikon emoji/font (contoh: 📄 untuk pengajuan, 👤 untuk wali kelas, 🛡️ untuk guru piket).
- **Status Kompleks**: Menambahkan visualisasi untuk status `rejected`, di mana garis (*line*) dan titik (*bead*) akan menyala merah, serta teks berubah tajam, berbeda dari status `pending` (kuning) atau `approved` (hijau).
- **Deskripsi Ekstra**: Penambahan dukungan teks penjelasan (*description*), untuk memuat "Catatan Penolakan Wali Kelas" atau alasan keterlambatan langsung di bawah langkah waktu terkait.

## 2. Dasbor Utama Orang Tua (`(ortu)/dashboard.tsx`)
Dasbor diubah untuk memberikan ringkasan status anak dengan hierarki visual yang jelas.
- **Child Profile Card**: Penambahan kartu profil anak khusus di header atas (`AvatarInitials`, Nama, Kelas, NIS). Jika akun ini memantau siswa, data siswa langsung ditonjolkan.
- **Integrasi Top & Bottom Bar**: Terhubung dengan `TopAppBar` (Header universal) dan `BottomTabBar` (tab navigasi: Dashboard & Riwayat).
- **Visualisasi Timeline**: Kartu pengajuan izin terbaru tidak lagi menampilkan sekadar daftar teks, melainkan merangkum proses dari hulu ke hilir menggunakan `TimelineNode` di dalam `GlassCard`.

## 3. Layar Riwayat Lengkap (`(ortu)/riwayat.tsx`)
Layar baru diciptakan khusus untuk menjawab kebutuhan pencarian data izin lampau.
- **TopAppBar Khusus**: Menerima *props* kustom `title="Riwayat Lengkap"`.
- **Search & Filter Interaktif**: 
  - *Search Input* bergaya *glassmorphism* untuk mencari berdasarkan teks alasan atau jenis izin.
  - *Filter Pills* horizontal interaktif (Semua, Disetujui, Proses, Ditolak) menggunakan komponen *touchable* beraksen warna solid saat aktif.
- **Integrasi TicketCard**: Daftar riwayat dirender secara rapi menggunakan `TicketCard.tsx` universal yang sudah teruji di fase-fase sebelumnya.

## Kesimpulan Fase 4
Modul Orang Tua kini terasa seperti aplikasi pelacakan modern (*tracking app*). Tidak ada lagi kebingungan "sampai di mana izin anak saya diproses?", karena visualisasi `TimelineNode` secara gamblang memetakan apakah tiket masih *nyangkut* di wali kelas, ditolak, atau sudah disetujui penuh oleh satpam/guru piket.
