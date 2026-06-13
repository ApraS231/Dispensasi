# **Arsitektur & Pipeline Notifikasi SIdispen**

**(Laravel \+ SQLite \+ Expo React Native)**

Dokumen ini memuat perancangan teknis terperinci mengenai bagaimana notifikasi dikirim, dicatat, dan diterima oleh pengguna dalam ekosistem SIdispen. Sistem ini dirancang untuk menjembatani komunikasi yang cepat dan transparan antara siswa, wali kelas, guru piket, dan orang tua.

## **🏗️ 1\. Arsitektur Sistem (Cara Kerjanya)**

Pipeline ini menggunakan **Expo Push API** sebagai jembatan (pihak ketiga). Pendekatan ini dipilih agar *backend* Laravel tidak perlu berurusan langsung dengan kerumitan pengelolaan sertifikat ganda untuk Firebase Cloud Messaging (FCM di Android) atau Apple Push Notification service (APNs di iOS). Expo menyeragamkan format pengiriman menjadi satu *payload* universal.

**Alur Sederhananya:**

1. **Pemicu (Trigger):** Pengguna melakukan aksi kritikal, misalnya Siswa menekan tombol "Ajukan Izin" di HP-nya.  
2. **Backend (Laravel):** Server menerima data transaksi, menyimpannya ke *database* SQLite lokal, lalu secara asinkron memformat dan mengirim instruksi notifikasi ke Server Expo API.  
3. **Server Expo:** Bertindak sebagai *relay*, menerjemahkan instruksi tersebut dan merutekannya ke server infrastruktur bawaan OS (Google/Apple) berdasarkan jenis token.  
4. **HP Penerima (Wali Kelas):** Memunculkan *pop-up* notifikasi pada *status bar* perangkat, membunyikan nada dering *default*, dan menampilkan pesan singkat.  
5. **Aksi & Navigasi:** Wali Kelas mengetuk *pop-up* tersebut. Aplikasi yang sedang berada di *background* akan otomatis terbuka ke depan, menangkap parameter data, dan langsung diarahkan (*deep link*) ke halaman detail persetujuan izin tanpa harus mencari secara manual.

## **🗄️ 2\. Perancangan Database (SQLite)**

Kita membutuhkan modifikasi strategis pada dua tabel di SQLite agar sistem dapat melacak target pengiriman dan riwayat pesan secara persisten:

### **A. Tabel users (Penambahan Kolom)**

Kita harus tahu secara spesifik ke HP mana notifikasi harus dikirim. Oleh karena itu, tambahkan kolom device\_token (bertipe string, *nullable*).

* **Fungsi & Siklus Hidup:** Menyimpan token unik dari Expo untuk HP pengguna yang sedang aktif *login*. Jika pengguna *login* di perangkat baru, token lama di kolom ini akan tertimpa dengan token dari perangkat baru, memastikan notifikasi tidak menyasar ke perangkat yang sudah tidak digunakan.

### **B. Tabel notifications (Tabel Baru)**

Digunakan khusus untuk mendukung fitur *In-App Notification* (Kotak Masuk/Riwayat). Ini krusial sebagai cadangan jika *push notification* terlewat atau terhapus oleh pengguna.

* id (UUID) \- Primary Key untuk identifikasi unik.  
* user\_id (UUID) \- Relasi (*Foreign Key*) ke tabel pengguna (siapa penerimanya).  
* title (String) \- Judul singkat (Contoh: "Izin Baru Masuk", "Pendaftaran Kelas").  
* body (Text) \- Isi pesan penjelasan secara mendetail.  
* tipe (String) \- Jenis notif untuk menentukan *icon* atau warna UI di *frontend* (Contoh: ticket\_created, ticket\_approved, parent\_request).  
* reference\_id (UUID) \- *Nullable*, ID referensi (seperti ID tiket dispensasi atau ID kelas) agar notifikasi bisa berfungsi sebagai tombol yang dapat di-klik.  
* is\_read (Boolean) \- Default false. Indikator status baca yang mengatur cetak tebal (*bold*) pada daftar pesan.

## **📱 3\. Implementasi Sisi Mobile (Expo App)**

Di sisi aplikasi *mobile*, ada tiga tugas utama yang harus diorkestrasi menggunakan library expo-notifications:

### **Tugas 1: Mendapatkan & Menyimpan Token ke Laravel**

Saat pengguna berhasil *login*, aplikasi secara eksplisit meminta izin (*Permission*) ke sistem operasi Android/iOS. Jika diizinkan, aplikasi meminta token unik ke Expo. Jika ditolak, aplikasi tetap berjalan normal namun mengandalkan notifikasi *in-app* saja (*graceful degradation*).

// Di React Native (Frontend) \- Di dalam useEffect atau fungsi Login  
const { status } \= await Notifications.requestPermissionsAsync();  
if (status \=== 'granted') {  
    const token \= (await Notifications.getExpoPushTokenAsync()).data;  
    // Kirim token ini ke backend agar disimpan/diperbarui di SQLite  
    await axios.put('/api/user/device-token', { device\_token: token });  
}

### **Tugas 2: Indikator Titik Merah (In-App Badge)**

Agar pengguna segera menyadari adanya notifikasi baru tanpa harus terus-menerus membuka menu atau status bar, kita mengimplementasikan *polling* ringan. Setiap 15 detik (atau setiap kali halaman mendapatkan fokus / useFocusEffect), aplikasi memanggil API /api/notifications/unread-count. Interval 15 detik dipilih untuk menyeimbangkan sensasi *real-time* dengan efisiensi penggunaan baterai perangkat. Jika hasilnya count \> 0, UI akan me-render komponen titik merah (*red dot*) di pojok kanan atas ikon lonceng.

### **Tugas 3: Deep Linking (Navigasi saat Pop-up Ditekan)**

Mekanisme ini menghilangkan langkah ekstra dari pengguna. Gunakan *event listener* global addNotificationResponseReceivedListener. Saat *pop-up* ditekan, *listener* membedah *payload* JSON, mengekstrak variabel reference\_id atau ticket\_id, lalu menginstruksikan expo-router untuk melakukan *push navigation* langsung ke halaman spesifik (misalnya /ticket/\[id\]).

## **⚙️ 4\. Implementasi Sisi Backend (Laravel)**

Di kerangka kerja Laravel, kita memusatkan seluruh logika pengiriman ke dalam sebuah layanan (*Service Class*) yang dapat digunakan ulang bernama ExpoPushService.php.

**Aturan Emas (Sesuai Hasil Debugging Sebelumnya):**

Notifikasi harus **selalu dan wajib** dicatat ke dalam *database* SQLite lokal, tidak peduli apakah device\_token pengguna ada, kedaluwarsa, atau bernilai null (kosong). Ini adalah mekanisme *fail-safe* yang menjamin bahwa riwayat data komunikasi sistem tidak akan pernah hilang meskipun terjadi kegagalan jaringan atau pengguna belum masuk di HP-nya.

**Logika Beruntun dalam ExpoPushService::send():**

1. **Catat ke SQLite Dulu (In-App Logging):**  
   Lakukan *looping* terhadap setiap ID penerima di parameter $logForUserIds. Gunakan Notification::create(\[...\]) untuk mengamankan data ke dalam *database* secara permanen.  
2. **Cek dan Sanitasi Token Expo:**  
   Ambil device\_token milik target penerima dari tabel users.  
   * *Penting:* Berikan *fallback array* ?? \[\] untuk mencegah *fatal error* pada eksekusi kode selanjutnya apabila properti token bernilai null.  
3. **Tembak ke API Expo:**  
   Lakukan validasi akhir. Jika token terdeteksi valid (memiliki awalan wajib ExponentPushToken atau ExpoPushToken), jalankan *HTTP POST Request* ke server Expo. Proses ini sebaiknya dibungkus dengan *Try-Catch* agar jika server Expo sedang gangguan, aplikasi Laravel tidak akan *crash*.  
   // Format Payload JSON yang dikirim Laravel ke struktur API Expo:  
   Http::post('\[https://exp.host/--/api/v2/push/send\](https://exp.host/--/api/v2/push/send)', \[  
       'to' \=\> $device\_token,  
       'title' \=\> '⏳ Antrean Baru di Meja Piket',  
       'body' \=\> 'Ada siswa dari Kelas X-1 mengajukan dispensasi sakit.',  
       'data' \=\> \[  
           'ticket\_id' \=\> '1234-uuid-5678',  
           'type' \=\> 'ticket\_waiting\_piket'  
       \],  
       'sound' \=\> 'default'  
   \]);

## **🔄 5\. Skenario Alur Nyata (Contoh: Approval Guru Piket)**

Mari kita simulasikan interaksi nyata secara *end-to-end* yang menunjukkan ketangguhan *pipeline* ini:

1. Di tengah jam pelajaran, Wali kelas membuka aplikasinya, meninjau pengajuan izin sakit dari siswanya, lalu menekan tombol **"Setujui"**.  
2. Aplikasi *mobile* menembak API Laravel: POST /api/dispensasi/{id}/approve-wali.  
3. Laravel memproses logika bisnisnya dan memperbarui kolom status tiket di tabel dispensasi\_tickets menjadi waiting\_piket dalam basis data SQLite.  
4. Laravel mengidentifikasi siapa Guru Piket yang jadwalnya sedang aktif pada jam tersebut, lalu memanggil fungsi layanan:  
   ExpoPushService::send($guru\_piket-\>device\_token, 'Tiket Disetujui Wali', ...)  
5. Layanan ExpoPushService langsung mengunci riwayat pencatatan ke tabel notifications (SQLite) agar terarsip aman untuk Guru Piket dan juga Siswa yang mengajukan.  
6. Menggunakan HTTP Client, Laravel mengirimkan muatan (*payload*) *request* ke *endpoint* exp.host.  
7. Dalam hitungan kurang dari 3 detik, layar HP Guru Piket dan HP Siswa menyala, memunculkan *pop-up push notification* berbunyi yang berisi pembaruan status izin tersebut.  
8. Siswa merasa lega, lalu menekan *pop-up* notifikasi di layarnya. Aplikasi Expo seketika terbangun, memproses parameter ticket\_id di dalam *pop-up*, dan mem-pintas (*bypass*) menu utama untuk langsung menampilkan halaman antrean QR Code yang siap dipindai di meja piket. Seluruh proses mengalir tanpa hambatan.