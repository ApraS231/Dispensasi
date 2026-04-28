# Laporan Implementasi UI/UX SiDispen (Fase 2: Core Screens)

Dokumen ini merupakan laporan penyelesaian dan dokumentasi teknis dari Fase 2. Fase ini berfokus pada perombakan layar-layar utama yang digunakan oleh Siswa, serta layar otentikasi awal.

## 1. Layar Autentikasi (`login.tsx`)
Desain otentikasi telah diubah secara menyeluruh untuk mencerminkan identitas desain premium aplikasi.
- **Glass Card Layout**: Form input kini dibungkus dalam komponen *Glass Card* yang melayang di atas *background gradient* kuning-hijau.
- **Deboss Input Fields**: Field input email dan password menggunakan gaya visual seolah-olah "menjorok" ke dalam (deboss) melalui trik *border color* asimetris.
- **Ikonogafi**: Menambahkan ikon native (✉️ dan 🔒) di dalam field text untuk memperkuat pemahaman secara visual.
- **Skeuo Button**: Tombol "Masuk ➔" dirancang tebal (emboss) dengan animasi sentuhan, yang menonaktifkan klik ganda saat status dalam keadaan *loading*.

## 2. Dasbor Utama Siswa (`(siswa)/dashboard.tsx`)
Layar dasbor siswa diubah menjadi representasi yang lebih rapi dengan memanfaatkan fondasi dari Fase 1.
- **Integrasi Navigasi**: Dasbor sekarang menggunakan `TopAppBar` dan diletakkan di atas `BottomTabBar` (dengan menu *Home, History, Permit, Profile*).
- **Header Premium**: Bagian atas dasbor tidak lagi teks polos, melainkan struktur *GlassCard* yang menampilkan sapaan waktu nyata, nama depan, *badge* kelas, dan lencana statis berukuran besar untuk menunjukkan "Jumlah Izin Bulan Ini".
- **Hierarki Konten**: Pembagian area layar sangat jelas: 38% atas untuk identitas/status, dan 62% bawah untuk *scrollable list* daftar pengajuan izin terbaru.

## 3. Komponen Inti Tiket
### A. `TicketCard.tsx`
Tampilan perwakilan data izin (*Ticket Card*) dirancang ulang agar menyerupai slip kertas digital.
- **Aksen Border**: Hilangnya emoji usang digantikan oleh garis *border* vertikal tebal warna hijau (sebagai tanda visual kartu).
- **Tipografi**: Tanggal dibuat tebal di atas (`Plus Jakarta Sans - Bold`), jenis izin diperbesar, dan deskripsi dipotong otomatis maksimal 2 baris.

### B. `NeonBadge.tsx`
Lencana status tiket ditingkatkan fungsionalitas dan konsistensinya.
- **Teks LabelCaps**: Menggunakan preset khusus `FONTS.labelCaps` (tebal, kapital penuh, dan huruf direnggangkan/ *letter-spacing*).
- **Penanganan Status Lengkap**: Kini mencakup status `approved_by_piket` dan membedakan antara status *Proses* (kuning pudar) dengan *Menunggu* (kuning solid/emas).

## 4. Formulir Pengajuan (`(siswa)/pengajuan.tsx`)
Pusat input data bagi siswa untuk mengajukan izin dirancang se-interaktif mungkin.
- **Info Banner**: Kotak kuning peringatan disematkan di bagian teratas untuk menjelaskan alur "Wali Kelas -> Guru Piket".
- **Dropdown (Picker) Native**: Menggunakan `@react-native-picker/picker` agar pemilihan tipe izin terasa *native* baik di Android maupun iOS.
- **Date & Time Picker Terpisah**: Pengguna kini memiliki tiga input waktu yang presisi via `@react-native-community/datetimepicker` (Tanggal, Waktu Mulai, Waktu Selesai).
- **Unggah Dokumen Asli**: Fitur pemilihan gambar secara *native* ditambahkan dengan `expo-image-picker`. Gambar diubah secara internal menjadi bentuk `FormData` agar dapat diterima oleh *Backend Laravel* dengan tipe konten *multipart/form-data*. Gambar yang terpilih akan tampil kecil (thumbnail) sebelum form disubmit.

## 5. Layar Validasi QR Code (`qr/[id].tsx`)
Layar ini adalah muara dari seluruh tiket yang telah berstatus *Approved Final*. Tampilannya direkayasa ulang untuk meyakinkan Satpam/Guru piket akan keaslian tiket.
- **Card Scanner Frame**: Barcode QR sekarang dibingkai dengan sudut siku-siku tebal (corner brackets) layaknya sedang disorot oleh sensor optik.
- **Inverted QR Background**: Bagian putih dan hitam pada kode QR dibalik/disesuaikan khusus (dengan rasio kontras yang tetap valid dibaca *scanner*) untuk memperkuat tema aplikasi.
- **Active Badge**: Menambahkan komponen khusus *IZIN AKTIF* dengan titik lampu indikator yang berkedip di pojok kiri atas.
- **Timeline Metadata**: Data "Tujuan Izin" dan "Batas Waktu Keluar" ditampilkan dengan tipografi tegas (`metaValueHighlight` untuk batas akhir) persis di bawah kode QR.
- **Tombol Validasi Berkedip**: Animasi rotasi / *pulsing* otomatis diterapkan pada tombol di bawah (menggunakan `Animated.loop`), menegaskan bahwa layar tidak di-*screenshot*.

## 6. Kesimpulan Fase 2
Seluruh pengalaman *front-facing* yang digunakan siswa telah dirombak ke antarmuka standar tinggi. Dari layar login hingga layar QR terakhir, aplikasi kini terasa modern, sangat taktil (*skeuomorphic*), dan minim distorsi visual. Sistem form pengajuan pun kini mengirimkan *payload* yang jauh lebih bersih dengan waktu yang presisi.
