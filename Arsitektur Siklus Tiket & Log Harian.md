# **Dokumentasi Perancangan: Siklus Tiket, Kedaluwarsa, & Log Harian**

Dokumen ini memuat spesifikasi arsitektur yang komprehensif untuk mengelola siklus hidup (*lifecycle*) tiket dispensasi secara utuh. Fokus utama perancangan ini meliputi manajemen masa berlaku tiket (12 Jam), pembatasan akses interaksi (*Read-Only Chat*), validasi presisi untuk kedaluwarsa QR Code, dan sistem pemantauan riwayat pemindaian harian oleh Guru Piket. Dengan arsitektur ini, sistem tidak hanya menerbitkan izin, tetapi juga mengawalnya hingga kedaluwarsa secara otomatis dan terekam dengan akurat.

## **1\. Modifikasi Skema Database (PostgreSQL / Supabase)**

Untuk mendukung fitur kedaluwarsa dan perekaman riwayat pemindaian yang lebih presisi, kita akan menyesuaikan tabel dispensasi\_tickets. Struktur ini dirancang untuk menjaga riwayat audit yang ketat atas setiap pergerakan siswa.

\-- Penambahan kolom kontrol waktu dan pelacakan scanner  
ALTER TABLE dispensasi\_tickets  
ADD COLUMN expires\_at TIMESTAMP WITH TIME ZONE, \-- Waktu absolut tiket hangus. Tipe data WITH TIME ZONE sangat krusial untuk mencegah bias waktu antar perangkat.  
ADD COLUMN is\_scanned BOOLEAN DEFAULT FALSE, \-- Flag status pemindaian untuk membedakan tiket yang baru disetujui dengan tiket yang sudah dieksekusi di gerbang.  
ADD COLUMN scanned\_at TIMESTAMP WITH TIME ZONE, \-- Pencatatan presisi hingga hitungan detik kapan siswa benar-benar melewati gerbang.  
ADD COLUMN scanner\_id UUID REFERENCES users(id); \-- Relasi ke pengguna (Guru Piket) yang memindai, krusial untuk akuntabilitas operasional.

\-- Pembuatan Index untuk optimasi fitur "Daily Log" (Reset Harian)  
\-- Menggabungkan tanggal pembuatan dan ID Guru Piket menjadi Composite Index.  
\-- Ini memastikan bahwa ketika Guru Piket membuka log harian, database tidak perlu melakukan full-table scan (membaca ribuan baris data selama satu semester), melainkan langsung melompat ke blok data khusus untuk guru tersebut di hari ini.  
\-- Catatan: Fungsi expression (seperti DATE) dalam index PostgreSQL wajib menggunakan kurung ganda  
CREATE INDEX idx\_tickets\_daily\_log ON dispensasi\_tickets ((created\_at::DATE), guru\_piket\_id);

## **2\. Aturan Bisnis & Logika Backend (Laravel)**

Bagian ini memastikan bahwa server bertindak sebagai sumber kebenaran waktu tunggal (*Single Source of Truth*). Dengan menyerahkan seluruh kalkulasi waktu ke server backend, kita secara efektif mencegah manipulasi waktu yang mungkin dilakukan oleh siswa melalui pengaturan jam di *smartphone* mereka.

### **A. Pengaturan Zona Waktu (Krusial)**

Agar fitur "Reset Harian" (Daily Reset) berjalan tepat pada pukul 00:00 waktu setempat, ubah file konfigurasi config/app.php di Laravel. Tanpa pengaturan zona waktu yang seragam, fitur *Daily Reset* bisa saja terjadi secara prematur di sore hari atau terlambat hingga keesokan paginya akibat perbedaan dengan waktu UTC.

'timezone' \=\> 'Asia/Jakarta', // Atau 'Asia/Makassar' / 'Asia/Jayapura' menyesuaikan lokasi geografis sekolah Anda

### **B. Trigger Penerbitan Tiket (Penetapan Expiry 12 Jam)**

Ketika tiket mencapai status persetujuan akhir (misal: disetujui Guru Piket atau Wali Kelas yang menjadi otoritas final), sistem akan langsung menetapkan expires\_at. Durasi 12 jam dipilih secara spesifik karena rentang ini menutupi seluruh jam operasional sekolah (mulai dari pagi hari hingga kegiatan ekstrakurikuler di sore hari), namun dengan sangat tegas mencegah siswa menggunakan ulang tiket tersebut pada keesokan harinya.

// Di dalam controller persetujuan tiket  
$ticket-\>update(\[  
    'status' \=\> 'approved\_final',  
    'qr\_token' \=\> \\Illuminate\\Support\\Str::uuid(),  
    'expires\_at' \=\> now()-\>addHours(12), // Kedaluwarsa tepat 12 jam dari detik persetujuan  
\]);

### **C. Pembatasan Modul Chat (Read-Only jika Expired)**

Untuk menjaga agar *database* tidak dipenuhi oleh pesan-pesan yang sudah tidak relevan (*spam*), sistem akan mencegah siswa atau guru mengirim pesan baru jika masa berlaku 12 jam sudah habis. Pengembalian status HTTP 403 (Forbidden) memberikan sinyal yang jelas kepada aplikasi *mobile* untuk tidak melakukan percobaan ulang.

// app/Http/Controllers/Api/ChatController.php (Fungsi POST sendMessage)  
$ticket \= DispensasiTicket::findOrFail($request-\>ticket\_id);

// Pengecekan real-time di sisi server  
if (now()-\>greaterThan($ticket-\>expires\_at)) {  
    return response()-\>json(\[  
        'message' \=\> 'Sesi chat telah berakhir. Tiket ini sudah kedaluwarsa.'  
    \], 403);  
}  
// ... Lanjut proses simpan pesan dan broadcast WebSocket jika belum kedaluwarsa

### **D. Penolakan Pemindaian QR (Expired QR)**

Ini adalah lapisan keamanan fisik di gerbang sekolah. Jika seorang siswa mencoba mengelabui sistem dengan menyimpan tangkapan layar (*screenshot*) QR Code dan mencoba menggunakannya keesokan harinya, sistem akan langsung menolaknya.

// app/Http/Controllers/Api/QRController.php (Fungsi POST validateQR)  
$ticket \= DispensasiTicket::where('qr\_token', $request-\>qr\_token)-\>firstOrFail();

// Validasi waktu kedaluwarsa sebelum mengecek hal lain  
if (now()-\>greaterThan($ticket-\>expires\_at)) {  
    return response()-\>json(\['valid' \=\> false, 'message' \=\> 'Akses Ditolak: Tiket ini sudah KEDALUWARSA\!'\], 400);  
}

// Lanjut proses validasi dan secara permanen tandai tiket sebagai "telah dieksekusi"  
$ticket-\>update(\[  
    'status' \=\> 'completed\_exit',  
    'is\_scanned' \=\> true,  
    'scanned\_at' \=\> now(),  
    'scanner\_id' \=\> $request-\>user()-\>id // Mencatat jejak digital Guru Piket yang bertanggung jawab  
\]);

### **E. API Endpoint Log Harian (Daily Log)**

Endpoint ini dirancang untuk merender *Dashboard* Guru Piket secara efisien. Penggunaan teknik *Eager Loading* (with(\['siswa', 'scanner'\])) mencegah masalah *N+1 Query*, sehingga respons API tetap secepat kilat meskipun terdapat puluhan tiket dalam sehari.

// GET /api/piket/daily-log  
public function getDailyLog(Request $request) {  
    // Ambil batas awal dan batas akhir hari ini berdasarkan zona waktu server  
    $startOfDay \= now()-\>startOfDay();  
    $endOfDay \= now()-\>endOfDay();

    $logs \= DispensasiTicket::with(\['siswa', 'scanner'\])  
        \-\>whereBetween('created\_at', \[$startOfDay, $endOfDay\])  
        // Opsional: Batasi hanya pada tiket yang ditugaskan ke guru piket yang bersangkutan  
        // \-\>where('guru\_piket\_id', $request-\>user()-\>id)   
        \-\>orderBy('created\_at', 'desc')  
        \-\>get();

    return response()-\>json(\[  
        'date' \=\> now()-\>format('Y-m-d'),  
        'total' \=\> $logs-\>count(),  
        'scanned\_count' \=\> $logs-\>where('is\_scanned', true)-\>count(),  
        'data' \=\> $logs // Array log siap di-render oleh Frontend  
    \]);  
}

## **3\. Implementasi Frontend (UI/UX \- Expo React Native)**

Menggunakan pola desain *Skeuo-Glass* dan Tipografi *Plus Jakarta Sans*. Transisi status (dari aktif menjadi kedaluwarsa) dirancang untuk memberikan umpan balik visual yang instan dan tak terbantahkan kepada pengguna.

### **A. UI Tampilan Chat Read-Only (Halaman ticket/\[id\].tsx)**

Pada *State* lokal aplikasi React Native, sistem akan membandingkan waktu saat ini dengan ticket.expires\_at.

* **Jika Aktif:** Tampilkan komponen \<Input\> yang interaktif dan tombol kirim seperti biasa.  
* **Jika Kedaluwarsa:** Secara dinamis menyembunyikan elemen *Input* dan memunculkan *banner* peringatan. Penggunaan *overlay* warna merah pudar memberikan isyarat visual yang tegas namun tetap mempertahankan estetika *Skeuo-Glass*.

{isExpired ? (  
    \<Box bg="rgba(255, 0, 0, 0.1)" p="$3" borderRadius="$lg" alignItems="center"\>  
        \<Text fontFamily="Plus Jakarta Sans" fontWeight="bold" color="$red500"\>  
            Sesi Chat Telah Berakhir  
        \</Text\>  
        \<Text fontFamily="Plus Jakarta Sans" fontSize="$sm" color="$textDark" textAlign="center" mt="$1"\>  
            Masa berlaku tiket 12 jam telah habis. Seluruh riwayat percakapan di bawah ini sekarang bersifat Read-Only untuk keperluan arsip.  
        \</Text\>  
    \</Box\>  
) : (  
    \<ChatInputArea onSend={sendMessage} /\>  
)}

### **B. UI Tampilan QR Code (Halaman qr-code/\[id\].tsx milik Siswa)**

* **Jika Aktif:** Tampilkan komponen QRCode yang jelas di dalam sebuah *Glass Card*.  
* **Jika Kedaluwarsa:** Menghapus komponen QRCode sepenuhnya dari *render tree* adalah langkah keamanan *frontend* yang esensial. Hal ini mencegah siswa yang paham teknologi untuk mencoba mengekstrak data SVG dari aplikasi. Sebagai gantinya, layar akan menampilkan ikon kedaluwarsa yang mencolok.

{isExpired ? (  
    \<Box alignItems="center" justifyContent="center" height={250} style={{ opacity: 0.6 }}\>  
        \<Ionicons name="time-outline" size={64} color="\#EF4444" /\>  
        \<Text mt="$4" fontFamily="Plus Jakarta Sans" fontWeight="900" fontSize="$2xl" color="\#EF4444"\>  
            TICKET EXPIRED  
        \</Text\>  
        \<Text mt="$2" fontFamily="Plus Jakarta Sans" color="gray" textAlign="center"\>  
            QR Code telah dihapus secara permanen dari perangkat Anda.  
        \</Text\>  
    \</Box\>  
) : (  
    \<QRCode value={ticket.qr\_token} size={250} /\>  
)}

### **C. UI Halaman Log Harian (Dashboard Guru Piket)**

Desain log ini bertindak sebagai alat pelaporan (*reporting tool*) yang intuitif. Karena berbasis API yang difilter dengan startOfDay dan endOfDay, maka setiap jam 00:00 malam, API getDailyLog akan secara natural mengembalikan array kosong \[\]. Ini memicu UI untuk "Mereset" daftar tiket tanpa perlu intervensi manual apa pun.

Desain kartu komponen menonjolkan hierarki informasi: siapa siswa yang keluar, apa alasan izinnya, dan kapan tepatnya ia melewati gerbang.

* **Card Komponen (DailyLogCard):**

export function DailyLogCard({ ticket }) {  
    return (  
        \<Box   
            p="$4" mb="$3" borderRadius="$xl"   
            bg="rgba(255,255,255,0.8)"   
            borderWidth={1} borderColor="rgba(208, 235, 148, 0.5)"  
            style={{ elevation: 2 }} // Menambah sedikit bayangan untuk memisahkan kartu dari background  
        \>  
            \<HStack justifyContent="space-between" alignItems="center"\>  
                \<VStack flex={1} mr="$2"\>  
                    \<Text fontFamily="Plus Jakarta Sans" fontWeight="bold" fontSize="$md" numberOfLines={1}\>  
                        {ticket.siswa.nama}  
                    \</Text\>  
                    \<Text fontFamily="Plus Jakarta Sans" color="$textLight" fontSize="$sm" numberOfLines={1}\>  
                        Izin: {ticket.jenis\_izin}  
                    \</Text\>  
                \</VStack\>  
                  
                {/\* Lencana Status Scan dengan Feedback Waktu \*/}  
                {ticket.is\_scanned ? (  
                    \<VStack alignItems="flex-end"\>  
                        \<Badge bg="\#50EB63" borderRadius="$full" px="$3" py="$1"\>  
                            \<Text color="white" fontWeight="bold" fontSize="$xs"\>Telah Discan\</Text\>  
                        \</Badge\>  
                        \<Text fontSize="$xs" mt="$1" color="gray" fontFamily="Plus Jakarta Sans"\>  
                            Oleh: {ticket.scanner.nama}   
                        \</Text\>  
                        \<Text fontSize="$xs" fontWeight="bold" fontFamily="Plus Jakarta Sans"\>  
                            Jam {formatTime(ticket.scanned\_at)} {/\* Contoh Output: Jam 14:30 WITA \*/}  
                        \</Text\>  
                    \</VStack\>  
                ) : (  
                    \<Badge bg="\#EBD350" borderRadius="$full" px="$3" py="$1"\>  
                        \<Text color="white" fontWeight="bold" fontSize="$xs"\>Menunggu Scan\</Text\>  
                    \</Badge\>  
                )}  
            \</HStack\>  
        \</Box\>  
    );  
}

## **4\. Analisis Keamanan & Keandalan Alur**

Arsitektur siklus tiket ini didesain dengan tiga pilar ketahanan sistem:

1. **Anti-Manipulasi Waktu HP (Server-Side Validation):** Dengan selalu bergantung pada fungsi now() dari sisi server (Backend Laravel yang tersinkronisasi dengan *Network Time Protocol / NTP*) dan mengunci nilai expires\_at secara permanen di Supabase, sistem ini benar-benar kebal dari trik memanipulasi waktu lokal. Jika seorang siswa memundurkan jam atau tanggal di pengaturan *smartphone*\-nya, validasi QR Code di server tetap akan menolak aksesnya karena waktu server sudah menunjukkan tiket tersebut kedaluwarsa.  
2. **Kinerja Log Harian Tanpa Beban Pemeliharaan (Maintenance-Free Auto-Reset):** Pendekatan konvensional seringkali menggunakan *script cron job* untuk mereset data setiap malam. Namun, *cron job* rentan gagal jika server mengalami *restart* tepat di tengah malam. Dengan pendekatan kueri dinamis whereBetween('created\_at', \[$startOfDay, $endOfDay\]), sistem secara otomatis hanya menarik data untuk kalender hari berjalan. Ini menghilangkan kebutuhan *cron job*, membuat sistem bebas pemeliharaan, dan meminimalisir potensi *bug* operasional.  
3. **Akuntabilitas Petugas yang Tak Terbantahkan:** Dalam skenario dunia nyata, pos jaga seringkali dijaga oleh lebih dari satu orang. Dengan merekam secara presisi ID spesifik Guru Piket (scanner\_id) dan waktu presisi pemindaian (scanned\_at), sekolah mendapatkan riwayat jejak digital yang tidak bisa dibantah. Hal ini sangat berguna apabila di kemudian hari diperlukan pelaporan kepada Orang Tua, serta menghapus budaya saling melempar tanggung jawab (contoh: *"Saya kira tadi sudah di-scan sama guru yang lain"*).