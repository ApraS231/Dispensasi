const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Set margin explicitly to prevent PDFKit from auto-breaking pages when drawing headers/footers
const doc = new PDFDocument({ 
    margin: 50, 
    size: 'A4', 
    autoFirstPage: false 
});

const outputPathProject = path.join(__dirname, 'dokumentasi_database.pdf');
const outputPathArtifact = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\82f9d9db-4ece-4073-81fe-fe83640ca088\\dokumentasi_database.pdf';

const streamProject = fs.createWriteStream(outputPathProject);
const streamArtifact = fs.createWriteStream(outputPathArtifact);

doc.pipe(streamProject);
doc.pipe(streamArtifact);

// Colors
const PRIMARY = '#1E3A8A'; // Deep Navy
const SECONDARY = '#3B82F6'; // Blue
const TEXT_DARK = '#1F2937'; // Charcoal
const TEXT_MUTED = '#6B7280'; // Gray
const BG_LIGHT = '#F3F4F6'; // Light Gray
const ACCENT = '#EF4444'; // Red Accent

// Cover Page
doc.addPage();
doc.rect(0, 0, 595, 842).fill('#FAFAFA');
doc.rect(0, 0, 595, 25).fill(PRIMARY);

doc.fillColor(PRIMARY)
   .font('Helvetica-Bold')
   .fontSize(28)
   .text('DOKUMENTASI DATABASE\n& BATASAN DATA', 50, 180, { align: 'left' });

doc.fillColor(SECONDARY)
   .font('Helvetica')
   .fontSize(16)
   .text('Sistem Informasi Dispensasi Siswa (SIDISpen)', 50, 250);

doc.fillColor(TEXT_DARK)
   .font('Helvetica')
   .fontSize(11)
   .text('Standardisasi Skema Bahasa Indonesia, Panjang Karakter & Batasan Lapisan Validasi', 50, 290);

doc.moveTo(50, 320).lineTo(545, 320).strokeColor(SECONDARY).lineWidth(2).stroke();

doc.fillColor(TEXT_DARK)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('Lokasi File Pendefinisi Skema & Batasan:', 50, 360);

doc.font('Helvetica')
   .fontSize(9.5)
   .text('1. Skema Fisik & Panjang Data Database: database/migrations/', 70, 385)
   .text('2. Batasan Validasi Logika API (Lapisan Controller): app/Http/Controllers/Api/', 70, 405)
   .text('3. Batasan Form Panel Admin (Lapisan UI Filament): app/Filament/Resources/', 70, 425);

doc.fillColor(TEXT_MUTED)
   .font('Helvetica-Oblique')
   .fontSize(10)
   .text('Dibuat pada: Juli 2026\nVersi Dokumen: 3.3 (Perbaikan Total Halaman Kosong / Blank Page Bug)', 50, 720);

// Helper function to draw page header & footer
// Set Y to 770 instead of 800 to keep it inside the bottom margin (792) and prevent PDFKit auto-breaks
function addHeaderFooter(title) {
    doc.fillColor(PRIMARY)
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(title, 50, 30);
    doc.moveTo(50, 45).lineTo(545, 45).strokeColor(BG_LIGHT).lineWidth(1).stroke();

    doc.fillColor(TEXT_MUTED)
       .font('Helvetica')
       .fontSize(8)
       .text('Halaman ' + doc.bufferedPageRange().count, 50, 770, { align: 'right' });
}

// Page 2: Penjelasan Detail Tipe Data & Batasan Karakter
doc.addPage();
addHeaderFooter('PENJELASAN TIPE & PANJANG DATA');

doc.fillColor(PRIMARY)
   .font('Helvetica-Bold')
   .fontSize(14)
   .text('1. Penjelasan Panjang Data Berdasarkan Tipe Data', 50, 60);

doc.fillColor(TEXT_DARK)
   .font('Helvetica')
   .fontSize(9.5)
   .text('Setiap kolom pada database SIDISpen didefinisikan dengan panjang data yang terukur untuk menjaga efisiensi performa memori PostgreSQL/Supabase dan kestabilan transmisi data API.', 50, 80, { width: 495, align: 'justify' });

// Tipe Data Detail Table
const typeDetails = [
    { type: 'UUID', length: '36 Karakter', desc: 'Menampung string ID unik terenkripsi (v4). Digunakan sebagai Primary Key dan Foreign Key pada seluruh tabel.', file: 'Seluruh file migrasi' },
    { type: 'VARCHAR(10)', length: '10 Karakter', desc: 'Digunakan eksklusif untuk NISN Siswa karena format NISN nasional memiliki panjang tepat 10 digit angka.', file: 'profil_siswa migrasi' },
    { type: 'VARCHAR(20)', length: '20 Karakter', desc: 'Menampung status (enum), kategori dispensasi, hari piket, dan nomor telepon aktif.', file: 'dispensasi_tickets, dll' },
    { type: 'VARCHAR(50)', length: '50 Karakter', desc: 'Membatasi panjang nama kelas (contoh: "XII-IPA-2" panjangnya 9 karakter).', file: 'kelas migrasi' },
    { type: 'VARCHAR(100)', length: '100 Karakter', desc: 'Digunakan untuk nama lengkap pengguna dan alamat email.', file: 'users migrasi' },
    { type: 'VARCHAR(255)', length: '255 Karakter', desc: 'Menyimpan password Bcrypt terenkripsi dan path file foto/avatar di storage.', file: 'users, tiket migrasi' },
    { type: 'TEXT', length: 'Tak Terbatas', desc: 'Untuk data panjang bervariasi yang tidak bisa dibatasi, seperti alasan izin, pesan obrolan chat, dan token FCM.', file: 'tiket, chat, users' },
    { type: 'LONGTEXT', length: 'Tak Terbatas', desc: 'Untuk penyimpanan payload session serialize yang sangat besar.', file: 'users (tabel sessions)' }
];

let y = 135;
doc.rect(50, y, 495, 18).fill(PRIMARY);
doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);
doc.text('Tipe Data', 55, y + 5);
doc.text('Panjang Data', 150, y + 5);
doc.text('Deskripsi Penggunaan', 240, y + 5);
doc.text('File Terkait', 450, y + 5);

y += 18;
typeDetails.forEach((t, idx) => {
    if (idx % 2 === 1) {
        doc.rect(50, y, 495, 24).fill(BG_LIGHT);
    }
    doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(7.5);
    doc.text(t.type, 55, y + 5);
    doc.text(t.length, 150, y + 5);
    doc.text(t.desc, 240, y + 5, { width: 200 });
    doc.text(t.file, 450, y + 5, { width: 90 });
    y += 24;
});

// Section 2: Letak File Pendefinisi
y += 15;
doc.fillColor(PRIMARY)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('2. File Pendefinisi Batasan Data (Korelasi Kode Program)', 50, y);
y += 18;

doc.fillColor(TEXT_DARK)
   .font('Helvetica-Bold')
   .fontSize(8.5)
   .text('A. File Migrasi Database (Menentukan Struktur Fisik Database):', 50, y);
y += 12;
doc.font('Helvetica')
   .fontSize(8)
   .text('- database/migrations/0001_01_01_000000_create_users_table.php (Tabel pengguna & sessions)', 65, y)
   .text('- database/migrations/2026_04_25_154129_create_kelas_table.php (Tabel kelas)', 65, y + 10)
   .text('- database/migrations/2026_04_25_154132_create_dispensasi_tickets_table.php (Tabel tiket_dispensasi)', 65, y + 20);
y += 35;

doc.fillColor(TEXT_DARK)
   .font('Helvetica-Bold')
   .fontSize(8.5)
   .text('B. File Controller API (Menyaring Masukan Pengguna pada Aplikasi Mobile):', 50, y);
y += 12;
doc.font('Helvetica')
   .fontSize(8)
   .text('- app/Http/Controllers/Api/AuthController.php (Validasi Login, Register, & Profile - Limit Nama & Email)', 65, y)
   .text('- app/Http/Controllers/Api/Master/SiswaProfileController.php (Validasi Input NISN Siswa wajib 10 digit)', 65, y + 10)
   .text('- app/Http/Controllers/Api/DispensasiController.php (Validasi Tiket Dispensasi, Kategori & Bukti Foto)', 65, y + 20);

// Database Tables Data
const allTables = [
    {
        name: 'pengguna',
        desc: 'Mengelola akun seluruh pengguna aplikasi (Admin, Piket, Wali Kelas, Orang Tua, Siswa).',
        file: '0001_01_01_000000_create_users_table.php',
        fields: [
            { name: 'id_pengguna', type: 'UUID', extra: 'PK', desc: 'Primary Key berupa UUID v4 (36 karakter)' },
            { name: 'nama', type: 'VARCHAR(100)', extra: 'Required', desc: 'Nama lengkap pengguna (Max 100 karakter)' },
            { name: 'email', type: 'VARCHAR(100)', extra: 'Unique', desc: 'Alamat email pengguna (Max 100 karakter)' },
            { name: 'password', type: 'VARCHAR(255)', extra: 'Required', desc: 'Hash password Bcrypt terenkripsi (255 karakter)' },
            { name: 'peran', type: 'VARCHAR(20)', extra: 'Enum', desc: 'Peran: admin, piket, wali_kelas, orang_tua, siswa' },
            { name: 'telepon', type: 'VARCHAR(20)', extra: 'Required', desc: 'Nomor telepon aktif (Max 20 karakter)' },
            { name: 'foto', type: 'VARCHAR(255)', extra: 'Nullable', desc: 'Path avatar pengguna di Supabase S3 (Max 255)' },
            { name: 'fcm_token', type: 'TEXT', extra: 'Nullable', desc: 'Token FCM untuk Push Notification mobile app' }
        ]
    },
    {
        name: 'kelas',
        desc: 'Mengelola data kelas sekolah dan wali kelas pendamping.',
        file: '2026_04_25_154129_create_kelas_table.php',
        fields: [
            { name: 'id_kelas', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'nama_kelas', type: 'VARCHAR(50)', extra: 'Required', desc: 'Nama kelas (contoh: XII-IPA-1) (Max 50)' },
            { name: 'id_wali_kelas', type: 'UUID', extra: 'FK', desc: 'Menghubungkan ke tabel pengguna (wali_kelas)' }
        ]
    },
    {
        name: 'profil_siswa',
        desc: 'Profil detail siswa, menghubungkan siswa ke kelas dan orang tua.',
        file: '2026_04_25_154129_create_siswa_profiles_table.php',
        fields: [
            { name: 'id_siswa_profile', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_pengguna', type: 'UUID', extra: 'FK', desc: 'Menghubungkan ke tabel pengguna (siswa)' },
            { name: 'nisn', type: 'VARCHAR(10)', extra: 'Unique', desc: 'Nomor Induk Siswa Nasional (Tepat 10 digit)' },
            { name: 'id_kelas', type: 'UUID', extra: 'FK, Nullable', desc: 'Menghubungkan ke kelas' },
            { name: 'id_orang_tua', type: 'UUID', extra: 'FK, Nullable', desc: 'Menghubungkan ke wali murid (orang_tua)' }
        ]
    },
    {
        name: 'jadwal_piket',
        desc: 'Pembagian hari piket harian untuk guru/staf piket.',
        file: '2026_04_25_154130_create_piket_schedules_table.php',
        fields: [
            { name: 'id_jadwal_piket', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_guru', type: 'UUID', extra: 'FK', desc: 'Menghubungkan ke tabel pengguna (guru piket)' },
            { name: 'hari', type: 'VARCHAR(10)', extra: 'Required', desc: 'Hari piket (Senin - Sabtu) (Max 10)' }
        ]
    },
    {
        name: 'log_kehadiran_piket',
        desc: 'Pencatatan kehadiran piket harian guru.',
        file: '2026_04_25_154131_create_piket_attendance_logs_table.php',
        fields: [
            { name: 'id_log_kehadiran', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_guru', type: 'UUID', extra: 'FK', desc: 'Menghubungkan ke tabel pengguna' },
            { name: 'tanggal', type: 'DATE', extra: 'Required', desc: 'Tanggal piket (YYYY-MM-DD)' },
            { name: 'waktu_masuk', type: 'TIME', extra: 'Required', desc: 'Jam scan kehadiran (HH:MM:SS)' },
            { name: 'status', type: 'VARCHAR(20)', extra: 'Required', desc: 'Status kehadiran piket (Max 20)' }
        ]
    },
    {
        name: 'tiket_dispensasi',
        desc: 'Tiket pengajuan dispensasi/izin keluar masuk sekolah siswa.',
        file: '2026_04_25_154132_create_dispensasi_tickets_table.php',
        fields: [
            { name: 'id_tiket_dispensasi', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_siswa', type: 'UUID', extra: 'FK', desc: 'Siswa pengaju (foreign key pengguna)' },
            { name: 'id_wali_kelas', type: 'UUID', extra: 'FK', desc: 'Wali kelas penyetujui (foreign key pengguna)' },
            { name: 'id_guru_piket', type: 'UUID', extra: 'FK, Nullable', desc: 'Staf piket penyetujui akhir' },
            { name: 'id_pemindai', type: 'UUID', extra: 'FK, Nullable', desc: 'Staf piket pemindai QR tiket' },
            { name: 'alasan', type: 'TEXT', extra: 'Required', desc: 'Alasan izin / dispensasi (Tanpa batas)' },
            { name: 'kategori', type: 'VARCHAR(20)', extra: 'Required', desc: 'Kategori: sakit, izin, dispensasi (Max 20)' },
            { name: 'status', type: 'VARCHAR(30)', extra: 'Required', desc: 'Status tiket dispensasi (Max 30)' },
            { name: 'waktu_mulai', type: 'DATETIME', extra: 'Required', desc: 'Jam/Tanggal mulai izin' },
            { name: 'waktu_selesai', type: 'DATETIME', extra: 'Required', desc: 'Jam/Tanggal selesai izin' },
            { name: 'waktu_keluar_aktual', type: 'DATETIME', extra: 'Nullable', desc: 'Waktu persis siswa scan QR keluar gerbang' },
            { name: 'waktu_masuk_aktual', type: 'DATETIME', extra: 'Nullable', desc: 'Waktu persis siswa scan QR kembali ke sekolah' },
            { name: 'bukti_foto', type: 'VARCHAR(255)', extra: 'Nullable', desc: 'Foto surat izin/sakit di Supabase Storage (Max 255)' }
        ]
    },
    {
        name: 'obrolan_tiket',
        desc: 'Log percakapan (chat) real-time di dalam tiket dispensasi.',
        file: '2026_04_25_154132_create_ticket_chats_table.php',
        fields: [
            { name: 'id_obrolan', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_tiket_dispensasi', type: 'UUID', extra: 'FK', desc: 'Menghubungkan ke tiket terkait' },
            { name: 'id_pengirim', type: 'UUID', extra: 'FK', desc: 'ID pengirim pesan (pengguna)' },
            { name: 'pesan', type: 'TEXT', extra: 'Required', desc: 'Isi teks percakapan (Tanpa batas)' }
        ]
    },
    {
        name: 'notifikasi',
        desc: 'Penyimpanan riwayat notifikasi push untuk aplikasi mobile.',
        file: '2026_04_25_154133_create_notifications_table.php',
        fields: [
            { name: 'id_notifikasi', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_pengguna', type: 'UUID', extra: 'FK', desc: 'Pengguna penerima notifikasi' },
            { name: 'judul', type: 'VARCHAR(100)', extra: 'Required', desc: 'Judul push notifikasi (Max 100)' },
            { name: 'isi', type: 'TEXT', extra: 'Required', desc: 'Isi ringkas notifikasi' },
            { name: 'tipe', type: 'VARCHAR(30)', extra: 'Required', desc: 'Jenis notifikasi (Max 30)' },
            { name: 'id_referensi', type: 'UUID', extra: 'Nullable', desc: 'ID tiket yang dirujuk' },
            { name: 'sudah_dibaca', type: 'BOOLEAN', extra: 'Default: false', desc: 'Status baca notifikasi di HP' }
        ]
    },
    {
        name: 'permintaan_hubung_ortu',
        desc: 'Log pengajuan verifikasi hubungan orang tua dengan siswa.',
        file: '2026_05_03_111301_create_parent_link_requests_table.php',
        fields: [
            { name: 'id_permintaan_hubung', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_orang_tua', type: 'UUID', extra: 'FK', desc: 'ID orang tua peminta' },
            { name: 'id_siswa', type: 'UUID', extra: 'FK', desc: 'ID siswa yang diklaim' },
            { name: 'status', type: 'VARCHAR(20)', extra: 'Default: pending, approved, rejected (Max 20)' }
        ]
    },
    {
        name: 'permintaan_gabung_kelas',
        desc: 'Log pengajuan siswa untuk masuk ke kelas tertentu.',
        file: '2026_05_06_063252_create_class_join_requests_table.php',
        fields: [
            { name: 'id_permintaan_gabung', type: 'UUID', extra: 'PK', desc: 'Primary Key UUID (36 karakter)' },
            { name: 'id_siswa', type: 'UUID', extra: 'FK', desc: 'ID siswa peminta' },
            { name: 'id_kelas', type: 'UUID', extra: 'FK', desc: 'ID kelas tujuan' },
            { name: 'status', type: 'VARCHAR(20)', extra: 'Default: pending, approved, rejected (Max 20)' }
        ]
    },
    {
        name: 'personal_access_tokens',
        desc: 'Tabel framework Laravel Sanctum untuk manajemen token autentikasi API.',
        file: '2026_04_25_143642_create_personal_access_tokens_table.php',
        fields: [
            { name: 'id', type: 'BIGINT', extra: 'PK, Increment', desc: 'Primary Key auto increment' },
            { name: 'tokenable_type', type: 'VARCHAR(255)', extra: 'Required', desc: 'Model terkait token (Max 255)' },
            { name: 'tokenable_id', type: 'UUID', extra: 'Required', desc: 'ID model terkait token (36 karakter)' },
            { name: 'name', type: 'VARCHAR(255)', extra: 'Required', desc: 'Nama token (Max 255)' },
            { name: 'token', type: 'VARCHAR(64)', extra: 'Unique', desc: 'Token hash login (64 karakter)' },
            { name: 'abilities', type: 'TEXT', extra: 'Nullable', desc: 'Kemampuan/akses token' },
            { name: 'last_used_at', type: 'TIMESTAMP', extra: 'Nullable', desc: 'Timestamp terakhir digunakan' },
            { name: 'expires_at', type: 'TIMESTAMP', extra: 'Nullable', desc: 'Timestamp masa kedaluwarsa' }
        ]
    },
    {
        name: 'sessions',
        desc: 'Tabel framework Laravel untuk manajemen database sessions.',
        file: '0001_01_01_000000_create_users_table.php',
        fields: [
            { name: 'id', type: 'VARCHAR(255)', extra: 'PK', desc: 'Session ID (Max 255)' },
            { name: 'user_id', type: 'UUID', extra: 'FK, Nullable', desc: 'ID pengguna terautentikasi (Foreign Key pengguna)' },
            { name: 'ip_address', type: 'VARCHAR(45)', extra: 'Nullable', desc: 'IP Address pengakses (Max 45)' },
            { name: 'user_agent', type: 'TEXT', extra: 'Nullable', desc: 'User Agent Browser pengakses' },
            { name: 'payload', type: 'LONGTEXT', extra: 'Required', desc: 'Data session serialized' },
            { name: 'last_activity', type: 'INTEGER', extra: 'Index', desc: 'Timestamp aktivitas terakhir' }
        ]
    }
];

// RENDER TABLES CONTINUOUSLY TO PREVENT UNNECESSARY EMPTY PAGES (Page 3 onwards)
doc.addPage();
addHeaderFooter('SKEMA TABEL & DETAIL FIELD');

let currentY = 60;

allTables.forEach(t => {
    // Only page break if we don't even have space for the Title + Header (approx 50pt)
    if (currentY + 50 > 750) {
        doc.addPage();
        addHeaderFooter('SKEMA TABEL & DETAIL FIELD');
        currentY = 60;
    }

    doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(11).text(`Tabel: ${t.name}`, 50, currentY);
    doc.fillColor(TEXT_MUTED).font('Helvetica-Oblique').fontSize(8).text(`File: database/migrations/${t.file}`, 350, currentY, { align: 'right' });
    currentY += 15;
    
    doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(9).text(t.desc, 50, currentY, { width: 495 });
    currentY += 20;

    // Draw field table headers
    doc.rect(50, currentY, 495, 15).fill(SECONDARY);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
    doc.text('Kolom / Field', 55, currentY + 4);
    doc.text('Tipe Data', 160, currentY + 4);
    doc.text('Aturan / Key', 260, currentY + 4);
    doc.text('Deskripsi / Batasan Panjang', 345, currentY + 4);
    currentY += 15;

    t.fields.forEach((f, idx) => {
        // If a row overflows, insert a page break
        if (currentY + 15 > 750) {
            doc.addPage();
            addHeaderFooter('SKEMA TABEL & DETAIL FIELD (LANJUTAN)');
            
            // Redraw table headers on the new page
            currentY = 60;
            doc.rect(50, currentY, 495, 15).fill(SECONDARY);
            doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
            doc.text('Kolom / Field', 55, currentY + 4);
            doc.text('Tipe Data', 160, currentY + 4);
            doc.text('Aturan / Key', 260, currentY + 4);
            doc.text('Deskripsi / Batasan Panjang', 345, currentY + 4);
            currentY += 15;
        }

        if (idx % 2 === 1) {
            doc.rect(50, currentY, 495, 15).fill(BG_LIGHT);
        }
        doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(7.5);
        doc.text(f.name, 55, currentY + 4);
        doc.text(f.type, 160, currentY + 4);
        doc.text(f.extra, 260, currentY + 4);
        doc.text(f.desc, 345, currentY + 4, { width: 195 });
        currentY += 15;
    });

    currentY += 15; // Space between tables
});

doc.end();
console.log('PDF Generated successfully!');
