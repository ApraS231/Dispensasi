# **Dokumentasi Database SiDispen (Sistem Dispensasi Digital)**

Dokumen ini menjelaskan struktur, relasi, dan alur kerja (workflow) database yang digunakan dalam aplikasi SiDispen. Sistem ini menggunakan **PostgreSQL** yang di-hosting melalui **Supabase**, dengan memanfaatkan UUID (*Universally Unique Identifier*) sebagai *Primary Key* untuk keamanan dan skalabilitas.

## **1\. Skema Tabel dan Relasi (Data Dictionary)**

Sistem terdiri dari 7 tabel utama yang dibagi menjadi tiga kelompok: Data Master, Data Operasional/Kehadiran, dan Data Transaksi Inti.

### **A. Data Master Utama**

Tabel-tabel ini menyimpan entitas utama yang jarang berubah dan biasanya dikelola oleh Admin.

**1\. Tabel users**

Menyimpan semua kredensial dan profil dasar pengguna aplikasi.

* id (UUID, PK) \- ID unik dari Supabase Auth.  
* name (Varchar) \- Nama lengkap pengguna.  
* email (Varchar, Unique) \- Email untuk keperluan login.  
* role (Enum) \- Peran pengguna: admin, siswa, orang\_tua, guru\_piket, wali\_kelas.  
* device\_token (Varchar) \- Menyimpan token perangkat Expo untuk target pengiriman *Push Notification*.

**2\. Tabel kelas**

Menyimpan data master kelas dan penanggung jawabnya.

* id (UUID, PK)  
* nama\_kelas (Varchar) \- Contoh: "X IPA 1".  
* tingkat (Varchar) \- Contoh: "X", "XI", "XII".  
* wali\_kelas\_id (UUID, FK) \- Relasi ke tabel users (Role: wali\_kelas).

**3\. Tabel siswa\_profiles**

Data spesifik (profil tambahan) yang hanya dimiliki oleh akun dengan *role* siswa.

* id (UUID, PK)  
* user\_id (UUID, FK) \- Relasi 1-to-1 ke tabel users.  
* nis (Varchar, Unique) \- Nomor Induk Siswa.  
* kelas\_id (UUID, FK) \- Relasi ke tabel kelas.  
* orang\_tua\_id (UUID, FK) \- Relasi ke tabel users (Role: orang\_tua) agar orang tua bisa melihat rekap anaknya.

### **B. Data Kehadiran / Shift Piket**

Tabel untuk mengatur jadwal dan sesi kerja Guru Piket.

**4\. Tabel piket\_schedules**

Menyimpan jadwal baku guru piket per hari.

* id (UUID, PK)  
* guru\_id (UUID, FK) \- Relasi ke tabel users (Role: guru\_piket).  
* hari, jam\_mulai, jam\_selesai.

**5\. Tabel piket\_attendance\_logs**

Mencatat *log* sesi kerja Guru Piket (Sesi "Ready").

* id (UUID, PK)  
* guru\_id (UUID, FK)  
* waktu\_masuk (Timestamp) \- Terisi saat guru menekan tombol "Ready".  
* waktu\_keluar (Timestamp) \- Terisi saat guru menyelesaikan shift.  
* status\_aktif (Boolean) \- Jika true, guru ini akan menerima lemparan tiket izin siswa (*Auto-Assignment*).

### **C. Data Transaksi & Komunikasi**

Inti dari sistem dispensasi sekolah.

**6\. Tabel dispensasi\_tickets**

Tabel utama untuk merekam setiap permohonan dispensasi siswa.

* id (UUID, PK)  
* siswa\_id, kelas\_id (UUID, FK) \- Data pengaju tiket.  
* wali\_kelas\_id (UUID, FK) \- *Auto-filled* dari relasi kelas siswa.  
* guru\_piket\_id (UUID, FK) \- *Auto-filled* dari piket\_attendance\_logs yang sedang aktif.  
* piket\_attendance\_id (UUID, FK) \- Agar guru bisa merekap histori di satu shift spesifik.  
* jenis\_izin (Enum) \- sakit, keperluan\_keluarga, dll.  
* alasan (Text), lampiran\_bukti (Varchar).  
* waktu\_mulai, waktu\_selesai (Datetime).  
* status (Enum) \- pending, approved\_by\_wali, approved\_by\_piket, approved\_final, rejected.  
* qr\_code\_token (Varchar, Unique) \- Token hasil *generate* untuk dirender menjadi gambar QR Code saat status approved\_final.

**7\. Tabel ticket\_chats**

Menyimpan riwayat obrolan/klarifikasi di dalam satu tiket.

* id (UUID, PK)  
* dispensasi\_ticket\_id (UUID, FK) \- Obrolan diikat ke tiket tertentu.  
* sender\_id (UUID, FK) \- Siapa yang mengirim pesan.  
* pesan (Text) \- Isi pesan chat.  
* is\_read (Boolean).

## **2\. Alur Database (Database Workflow)**

Bagian ini menjelaskan bagaimana data bergerak dan diperbarui (*Create, Read, Update, Delete*) dari satu tabel ke tabel lain pada skenario utama aplikasi.

### **Alur 1: Penentuan Guru Piket Bertugas (Shift Start)**

1. Guru Piket *login* via Mobile App.  
2. Saat menekan tombol **"Set Ready"**, backend akan melakukan *INSERT* ke tabel piket\_attendance\_logs.  
3. Kolom status\_aktif diset menjadi true, dan waktu\_masuk dicatat dengan jam saat ini.  
4. *Trigger Logika:* Mulai detik ini, setiap tiket yang dibuat akan dialamatkan ke guru\_id pada log ini.

### **Alur 2: Pengajuan Izin oleh Siswa (Auto-Assignment)**

1. Siswa mengisi *form* pengajuan izin.  
2. Backend akan membaca user\_id siswa dan melakukan *SELECT* (Join) ke tabel siswa\_profiles dan kelas untuk mendapatkan data kelas\_id serta wali\_kelas\_id.  
3. Backend juga melakukan *SELECT* ke piket\_attendance\_logs untuk mencari guru\_id yang memiliki status\_aktif \= true.  
4. Backend melakukan *INSERT* ke tabel dispensasi\_tickets. Semua kolom (siswa\_id, kelas\_id, wali\_kelas\_id, guru\_piket\_id) **terisi secara otomatis** berdasarkan hasil *SELECT* sebelumnya. Status diset pending.

### **Alur 3: Alur Persetujuan & Penerbitan QR Code**

1. Guru (Wali Kelas/Piket) membuka tiket dan menekan tombol **"Approve"**.  
2. Backend melakukan *UPDATE* pada tabel dispensasi\_tickets untuk merubah status (misal dari pending ke approved\_final).  
3. Jika status telah mencapai approved\_final, sistem akan membuat string UUID baru dan menyimpannya (UPDATE) ke kolom qr\_code\_token.  
4. Aplikasi mobile milik siswa akan membaca kolom qr\_code\_token ini lalu mengubah (render) nilai tersebut menjadi wujud *QR Code Image* menggunakan *library* Expo.

### **Alur 4: Komunikasi Real-Time (Ticket Chat)**

1. Jika guru menanyakan detail alasan, sistem melakukan *INSERT* ke tabel ticket\_chats.  
2. *Supabase WebSockets (Replication)* mendeteksi adanya operasi *INSERT* pada tabel ini.  
3. Database memancarkan (*broadcast*) baris data baru tersebut langsung ke perangkat pengguna (Siswa & Guru) secara sinkron, merubah tampilan obrolan tanpa aplikasi memanggil API ulang.

### **Alur 5: Dashboard Rekapitulasi & Monitoring (Orang Tua & Guru)**

* **Orang Tua:** Saat membuka aplikasi, backend melakukan query SELECT \* FROM dispensasi\_tickets lalu memfilternya dengan klausa WHERE siswa\_id IN (mencari siswa yang berelasi dengan orang\_tua\_id).  
* **Wali Kelas:** Rekapitulasi diambil dengan klausa WHERE kelas\_id IN (kelas yang diasuh oleh wali kelas ini).  
* **Guru Piket:** Rekapitulasi hari ini diambil dengan klausa WHERE piket\_attendance\_id \= (id log shift yang sedang aktif).