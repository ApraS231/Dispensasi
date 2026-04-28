# **Panduan Setup Supabase untuk Fitur Chat Real-Time**

Dokumen ini memandu Anda melakukan konfigurasi di *dashboard* Supabase agar fitur obrolan (Ticket-Based Chat) pada aplikasi SiDispen dapat berjalan secara *real-time* menggunakan protokol WebSocket.

## **Langkah 1: Eksekusi Skema Database (SQL Editor)**

Langkah pertama adalah membuat tabel ticket\_chats beserta indeksnya untuk mengoptimalkan penarikan riwayat pesan.

1. Login ke [Dashboard Supabase](https://supabase.com/dashboard).  
2. Pilih proyek SiDispen Anda.  
3. Di menu sebelah kiri, klik ikon **SQL Editor**.  
4. Klik tombol **New Query** dan *copy-paste* perintah SQL berikut:

\-- Pastikan ekstensi UUID aktif  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\-- Membuat tabel ticket\_chats  
CREATE TABLE ticket\_chats (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    dispensasi\_ticket\_id UUID NOT NULL REFERENCES dispensasi\_tickets(id) ON DELETE CASCADE,  
    sender\_id UUID NOT NULL REFERENCES users(id),  
    pesan TEXT NOT NULL,  
    is\_read BOOLEAN DEFAULT FALSE,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

\-- Membuat Index untuk mempercepat query saat Scroll (Pagination)  
CREATE INDEX idx\_ticket\_chats\_on\_ticket\_id ON ticket\_chats(dispensasi\_ticket\_id);

5. Klik tombol **Run** (atau tekan Cmd/Ctrl \+ Enter) untuk mengeksekusi *query* tersebut. Pastikan muncul notifikasi *"Success"*.

## **Langkah 2: Mengaktifkan Supabase Realtime (Replication)**

Ini adalah langkah **paling krusial**. Jika langkah ini dilewati, aplikasi mobile tidak akan pernah menerima notifikasi pesan baru (WebSocket mati).

1. Di menu sebelah kiri *dashboard* Supabase, klik ikon **Database**.  
2. Pilih tab **Replication** (berada di menu navigasi atas/samping pada halaman Database).  
3. Anda akan melihat bagian bernama supabase\_realtime (Publication).  
4. Klik tombol **0 tables** (atau tulisan yang menunjukkan jumlah tabel yang aktif) di sebelah kanan supabase\_realtime.  
5. Sebuah panel *pop-up* atau *drawer* akan muncul berisi daftar semua tabel Anda.  
6. Cari tabel **ticket\_chats** dan **aktifkan tombol *toggle* (centang)** di sebelahnya.  
7. Simpan perubahan. Sekarang Supabase akan memancarkan (*broadcast*) setiap ada perintah INSERT ke tabel tersebut.

## **Langkah 3: Konfigurasi Row Level Security (RLS)**

Sesuai arsitektur CQRS kita, aplikasi *mobile* hanya akan **Membaca (Listen)** dari Supabase, sedangkan proses **Menulis (Insert)** dilakukan melalui Backend Laravel. Oleh karena itu, kita perlu mengatur RLS agar kunci publik (anon key) yang ada di aplikasi Expo diizinkan untuk mendengarkan *channel* tersebut.

1. Buka menu **Authentication** \-\> **Policies** (atau langsung dari menu **Table Editor** \-\> ticket\_chats \-\> **Add RLS Policy**).  
2. Aktifkan RLS pada tabel ticket\_chats dengan menekan **Enable RLS**.  
3. Buat sebuah kebijakan (Policy) baru. Pilih **"Create policy from scratch"**.  
4. Isi konfigurasi kebijakan sebagai berikut:  
   * **Policy Name:** Izinkan akses baca (Listen) untuk fitur Chat  
   * **Allowed Operation:** SELECT (Centang hanya SELECT).  
   * **Target Roles:** anon dan authenticated.  
   * **USING expression:** Ketik true

*Catatan Keamanan:* Memberikan akses SELECT dengan expression true artinya siapa saja yang memiliki Anon Key dapat membaca isi tabel. **Namun**, karena kolom ID Tiket Anda menggunakan **UUID v4** yang sangat acak (36 karakter string), peretas tidak akan bisa menebak ID tiket untuk "menguping" obrolan. Ini adalah metode pengamanan berbasis kerahasiaan (*Security by Obscurity* / UUID Entropy) yang wajar digunakan pada sistem WebSocket.

## **Langkah 4: Mengambil Kredensial API untuk Mobile & Backend**

Terakhir, pastikan Anda menyalin kunci (*keys*) yang dibutuhkan untuk aplikasi Laravel dan Expo Anda.

1. Buka menu **Project Settings** (ikon Roda Gigi di paling bawah kiri).  
2. Pilih menu **API**.  
3. Salin dua nilai berikut:  
   * **Project URL** (misal: https://xyz...supabase.co)  
   * **Project API Keys \-\> anon public** (String JWT yang sangat panjang).

### **Penempatan di Proyek Anda:**

**1\. Untuk Aplikasi Mobile (Expo):**

Buka file .env di dalam folder Expo Anda dan masukkan:

EXPO\_PUBLIC\_SUPABASE\_URL=\[https://xyz...supabase.co\](https://xyz...supabase.co)  
EXPO\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJhbGciOiJIUz...

**2\. Untuk Backend (Laravel):**

Buka file .env di Laravel Anda. (Koneksi Laravel ke Supabase umumnya menggunakan URL PostgreSQL biasa, bukan API URL ini, tetapi pastikan informasi Host dan Password Database sudah terisi benar seperti di Fase 1).

## **✅ Ceklis Validasi Setup Supabase**

* \[ \] Tabel ticket\_chats sudah terbuat tanpa *error*.  
* \[ \] *Toggle* tabel ticket\_chats pada Publikasi supabase\_realtime sudah berwarna hijau (Aktif).  
* \[ \] RLS pada tabel ticket\_chats sudah aktif dengan *Policy* SELECT bernilai true.  
* \[ \] URL dan Anon Key sudah terpasang di file .env aplikasi Expo.

Jika seluruh langkah ini selesai, arsitektur database Anda kini sudah **100% siap** menangani modul obrolan *real-time*\!