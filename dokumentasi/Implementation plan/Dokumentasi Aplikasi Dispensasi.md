# **Dokumentasi Sistem Dispensasi Digital Sekolah (SiDispen)**

## **1\. Deskripsi Aplikasi**

**SiDispen** (Sistem Dispensasi Digital) adalah sebuah platform aplikasi mobile dan web terintegrasi yang dirancang untuk mengatasi masalah latensi persetujuan (keterlambatan approval) dan kesenjangan informasi dalam proses administrasi izin atau dispensasi siswa di sekolah.

Sistem ini menggantikan formulir perizinan kertas konvensional dengan sistem "Tiket Dispensasi" digital. Dengan memanfaatkan *push notification* secara *real-time*, validasi QR Code, dan sistem penugasan otomatis (*auto-assignment*), aplikasi ini menyederhanakan alur birokrasi, mempercepat persetujuan guru yang memiliki mobilitas tinggi, dan memberikan transparansi informasi secara instan kepada siswa dan orang tua.

## **2\. Tech Stack (Teknologi yang Digunakan)**

Aplikasi ini dibangun menggunakan arsitektur *decoupled* yang memisahkan antara platform Mobile (untuk pengguna harian), Web (untuk Admin), dan Backend/API.

* **Mobile Framework:** **Expo (React Native)** \- Memungkinkan pembuatan aplikasi lintas platform (Android/iOS) dengan satu basis kode.  
* **UI Components:** **Gluestack UI** \- Digunakan pada aplikasi mobile untuk membangun antarmuka pengguna (UI) yang konsisten, modern, dan aksesibel.  
* **Backend & API:** **Laravel** \- Berfungsi sebagai penyedia *REST API* yang handal, mengatur logika bisnis, *middleware* keamanan, otorisasi (menggunakan Laravel Sanctum), dan pengolahan data.  
* **Database & BaaS:** **Supabase (PostgreSQL)** \- Digunakan sebagai database utama yang aman (menggunakan arsitektur UUID). Supabase juga memfasilitasi penyimpanan dokumen (Storage) dan fitur langganan data (*real-time subscriptions*).

## **3\. Alur Sistem (Workflow)**

Alur perizinan dirancang agar berjalan mulus tanpa mengharuskan pengguna melakukan pengisian data yang repetitif:

1. **Persiapan Shift Guru Piket:** Guru piket yang bertugas pada jam tersebut membuka aplikasi dan menekan tombol **"Ready"**. Sistem mencatat waktu masuk (log kehadiran shift).  
2. **Pengajuan Tiket oleh Siswa:** Siswa mengajukan izin via aplikasi mobile dengan mengisi jenis izin dan alasan.  
3. **Auto-Assignment:** Backend Laravel secara otomatis merelasikan tiket tersebut ke:  
   * **Wali Kelas** (berdasarkan relasi master data kelas siswa).  
   * **Guru Piket** (berdasarkan siapa guru piket yang statusnya sedang "Ready").  
4. **Push Notification (Real-time):** Sistem menembakkan notifikasi instan ke *smartphone* Wali Kelas dan Guru Piket yang ditugaskan.  
5. **Proses Klarifikasi (Opsional):** Jika alasan kurang jelas, guru dapat membuka fitur **Chat** di dalam tiket tersebut untuk berkomunikasi langsung dengan siswa atau orang tua.  
6. **Persetujuan / Penolakan (Approval):** Guru menekan tombol *Approve* atau *Reject*.  
7. **Penerbitan QR Code:** Jika disetujui secara final, sistem meng-generate **QR Code** unik sebagai bukti validasi (menggantikan surat fisik).  
8. **Notifikasi Akhir:** Siswa dan Orang Tua menerima notifikasi instan mengenai status persetujuan tersebut.

## **4\. Fitur Utama**

* **Sistem Tiket Otomatis (Auto-Assignment):** Tidak perlu memilih wali kelas atau guru piket secara manual; sistem yang mencocokkan berdasarkan jadwal, data kelas, dan sesi *Ready*.  
* **Push Notification Real-Time:** Menghilangkan keharusan *refresh* aplikasi; notifikasi masuk seketika saat ada pembaruan status.  
* **Ticket-Based Chat:** Ruang diskusi terisolasi per tiket izin. Memastikan komunikasi untuk klarifikasi alasan izin tersimpan rapi sebagai rekam jejak.  
* **Validasi Izin Berbasis QR Code:** Menghilangkan penggunaan kertas (surat email PDF). Surat izin digital divalidasi langsung melalui QR Code di dalam aplikasi.  
* **Dashboard Monitoring Log:** Fitur pelacakan riwayat izin yang komprehensif untuk pengawasan oleh sekolah maupun orang tua.  
* **Dynamic Role & Middleware Auth:** Keamanan akses data ketat berdasarkan peran (*Role-Based Access Control*).

## **5\. Peran dan Fungsi dalam Aplikasi**

Aplikasi membagi fungsi berdasarkan 5 *role* (peran) utama:

### **A. Pengguna Mobile (Aplikasi Expo)**

#### **1\. Siswa**

* **Pengajuan Izin:** Membuat tiket dispensasi baru (sakit, urusan keluarga, dll).  
* **Live Status:** Melihat status tiket (Pending, Approved by Wali, Approved Final, Rejected).  
* **Penyimpanan QR Code:** Menampilkan QR Code surat izin yang telah disetujui (dapat ditunjukkan kepada satpam saat keluar gerbang).  
* **Chat Klarifikasi:** Membalas pesan dari guru jika dimintai penjelasan lebih lanjut.

#### **2\. Orang Tua**

* **Dashboard Monitoring:** Melihat log seluruh riwayat dispensasi anak dalam jangka waktu seminggu terakhir.  
* **Pasif Notifikasi:** Menerima *push notification* otomatis setiap kali anak mengajukan izin, disetujui, atau ditolak.  
* **Akses Chat:** Dapat ikut serta dalam *ticket-based chat* jika diperlukan klarifikasi langsung dari pihak sekolah.

#### **3\. Wali Kelas**

* **Approval System:** Menyetujui atau menolak tiket dispensasi khusus dari siswa-siswa di kelas yang dinaunginya.  
* **Rekapitulasi per Kelas:** Melihat rekap log dan statistik (jumlah izin, alasan terbanyak) khusus untuk siswa di kelasnya guna memantau ketertiban.

#### **4\. Guru Piket**

* **Tombol "Ready" (Shift):** Fitur krusial untuk memulai sesi tugas. Saat ditekan, tiket dari siswa akan otomatis dialihkan kepadanya.  
* **Approval System:** Menyetujui atau menolak tiket dispensasi.  
* **Rekapitulasi Harian (Shift-based):** Melihat daftar rekapitulasi siswa yang meminta izin *hanya* selama jam kerjanya (sesi *Ready*) di hari tersebut.

### **B. Pengguna Website (Dashboard Web)**

#### **5\. Admin Sekolah**

* **Manajemen Master Data:** Mengelola data Siswa, Guru, Orang Tua, dan penempatan Kelas.  
* **Manajemen Jadwal Piket:** Mengatur jadwal guru piket (tabel piket\_schedules) secara terstruktur.  
* **Monitoring Global:** Memantau seluruh operasional sistem, memonitor log dispensasi se-sekolah, serta mengecek efisiensi respons guru (berapa lama rata-rata waktu yang dibutuhkan dari *pending* hingga *approved*).