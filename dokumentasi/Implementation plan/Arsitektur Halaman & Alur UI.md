# **Arsitektur Halaman dan Alur Aplikasi (SiDispen)**

**Panduan Khusus untuk UI/UX Design Agent (Stitch)**

Dokumen ini adalah cetak biru (blueprint) komprehensif yang memetakan seluruh arsitektur halaman (pages), fitur inti, dan alur interaksi pengguna dalam aplikasi mobile SiDispen. Panduan ini dirancang dengan tingkat detail struktural dan visual yang spesifik agar *design agent* dapat menghasilkan antarmuka yang sangat presisi.

## **1\. Konteks Desain untuk Agent (Global Styles & Visual Language)**

Agar agent dapat menghasilkan desain yang konsisten dan memiliki kedalaman visual, terapkan aturan global berikut secara ketat pada setiap halaman dan komponen:

* **Tema Visual (Skeuo-Glass):** Ini adalah gabungan fungsionalitas UI fisik 3D (Skeuomorphism) dengan estetika tembus pandang modern (Liquid Glass/Glassmorphism). Efek ini bertujuan memberikan pengalaman taktil yang memuaskan dan antarmuka yang terasa "nyata" untuk meminimalisir kebingungan pengguna dari berbagai kalangan usia (Siswa hingga Orang Tua).  
  * *Karakteristik Kaca:* Gunakan backdrop-filter: blur(15px) hingga 20px untuk efek buram latar, dipadukan dengan garis batas putih semi-transparan (border: 1px solid rgba(255, 255, 255, 0.4)) di bagian atas dan kiri komponen untuk menciptakan ilusi pantulan cahaya (*specular highlight*).  
* **Palet Warna Utama (Golden Ratio Distribution):** \* *Background Dasar (60%):* Putih \#FFFFFF untuk ruang kosong yang optimal, atau Hijau Sangat Pudar \#D0EB94 untuk memberikan efek relaksasi pada mata saat melihat data.  
  * *Secondary / Panel Kaca (30%):* Hijau \#BAEB50 & \#79EB50. Digunakan untuk struktur komponen, *App Bar*, dan *tint* warna pada material kaca.  
  * *Accent / Tombol Aksi (10%):* Hijau Neon \#50EB63 (Sukses/Approve) & Kuning Emas \#EBD350 (Menunggu/Peringatan/Aksi Mendesak).  
* **Bentuk & Kedalaman (Shapes & Elevation):** Gunakan *rounded corners* (radius 16px \- 24px) untuk melembutkan tampilan semua *Card* dan *Button*.  
  * *Shadowing:* Berikan efek bayangan tebal dan menyebar (*drop shadow*) ke arah bawah (contoh: Y: 8px, Blur: 16px, Spread: \-4px, Opacity: 15%) untuk menegaskan ilusi objek melayang (Skeuomorphism) dari latar belakangnya.  
* **Tipografi:** Gunakan font *sans-serif* geometris yang bersih dan tebal untuk *heading* agar keterbacaan tetap terjaga meskipun diletakkan di atas material kaca yang kompleks.

## **2\. Peta Alur Utama (Global User Journey & Micro-interactions)**

Alur berikut menjelaskan tidak hanya perpindahan halaman, tetapi juga interaksi yang mengikat pengalaman pengguna:

1. ![][image1]\-\> Autentikasi \-\> Redirect mulus sesuai Role tanpa jeda pemuatan yang mengganggu.  
2. ![][image2]\-\> Guru mengaktifkan sakelar Shift di Dashboard \-\> Animasi transisi warna dan *haptic feedback* bergetar \-\> Guru secara resmi masuk ke dalam sistem antrean (*Auto-Assignment*).  
3. ![][image3]\-\> Buka Dashboard \-\> Klik FAB (+) melayang \-\> Muncul *Bottom Sheet* pengajuan \-\> Isi Form \-\> Submit dengan animasi pemrosesan singkat.  
4. ![][image4]\-\> Pemberitahuan instan masuk ke layar HP Guru Piket & Wali Kelas (*banner drop-down* dari OS perangkat).  
5. ![][image5]\-\> Klik Notifikasi langsung membuka Detail Tiket \-\> Guru meninjau alasan \-\> (Opsional: Membuka panel Chat untuk klarifikasi cepat) \-\> Klik tombol Approve fisik \-\> Status tiket berubah seketika secara *real-time*.  
6. ![][image6]\-\> Siswa menerima notifikasi persetujuan \-\> Buka Detail Tiket \-\> HP secara otomatis menyesuaikan kecerahan layar ke tingkat maksimum \-\> Tampilkan QR Code bervisual holografis ke Satpam.

## **3\. Rincian Halaman per Role (Page-by-Page Requirements)**

### **A. Modul Autentikasi (Universal)**

**Page 1: Login Screen (/login)**

* **Fungsi:** Pintu masuk universal dan terpusat untuk semua pengguna mobile.  
* **Layout:** Elemen difokuskan di tengah layar vertikal dan horizontal (*Center aligned*) dengan ruang napas (*whitespace*) yang luas di sekelilingnya.  
* **Komponen:**  
  * **Logo & Judul:** Teks "SiDispen" berukuran besar dengan tipografi *bold*. Dapat ditambahkan efek *emboss* ringan pada teks.  
  * **Input Field:** 2 buah input text (Email & Password). Desain input harus menggunakan efek *deboss* (seolah-olah area input tenggelam atau diukir ke dalam permukaan layar) dengan latar belakang abu-abu terang atau \#D0EB94 semi-transparan.  
  * **Login Button:** Tombol *Skeuomorphic* raksasa lebar penuh (*full-width*) berwarna \#50EB63 dengan teks "Masuk". Tombol ini harus terlihat seperti tombol fisik tebal yang sangat mengundang untuk ditekan.  
  * **Tautan Bantuan:** Teks kecil "Lupa Password?" di bawah tombol masuk dengan visibilitas yang rendah agar tidak mengganggu *focal point*.

### **B. Modul Siswa**

**Page 2: Dashboard Siswa (/siswa/dashboard)**

* **Layout (Golden Ratio):** 38% Header area atas, 62% Daftar Tiket area bawah yang dapat di-*scroll*.  
* **Komponen:**  
  * **Header Card (Liquid Glass):** Terletak membentang di atas. Menampilkan sapaan personal "Halo,![][image7]  
    ", detail Nama Kelas, dan lencana matriks kecil ("2 Izin Bulan Ini"). Saat *scroll* ke bawah, daftar tiket akan tampak melintas "di balik" header kaca ini.  
  * **List Tiket:** *Scrollable list* vertikal. Setiap *Card* tiket adalah representasi kertas digital yang menampilkan Tanggal, Jenis Izin (Sakit/Keluarga), dan Lencana Status dengan pendaran neon (Kuning \#EBD350 seolah lampu LED menyala untuk status Pending, Hijau \#50EB63 untuk status Approved).  
  * **FAB (Floating Action Button):** Tombol bulat melayang yang sangat dominan di pojok kanan bawah dengan ikon "+" berwarna dasar \#50EB63.

**Page 3: Form Pengajuan Izin (/siswa/pengajuan)**

* **Fungsi:** Form interaktif untuk membuat tiket baru. Muncul dari bawah layar dalam bentuk *Bottom Sheet* dengan efek *slide-up* yang halus.  
* **Komponen:**  
  * **Dropdown Jenis Izin:** Pemilih jenis izin dengan animasi menu *pop-over*.  
  * **Text Area Alasan:** Kotak teks luas yang mendukung multi-baris. Area ini akan melebar otomatis (*auto-grow*) mengikuti panjang teks yang diketik.  
  * **Upload Area (Opsional):** Kotak dengan garis putus-putus tebal (*dashed border*) untuk melampirkan foto bukti (surat dokter/ortu). Area ini berubah warna menjadi \#BAEB50 pucat saat foto berhasil diunggah, lengkap dengan *thumbnail* mini.  
  * **Submit Button:** Tombol "Kirim Pengajuan" mengambang dan menempel di bagian paling bawah layar (*sticky bottom*).

**Page 4: Tampilan QR Code Validasi (/siswa/qr-code)**

* **Fungsi:** Menampilkan bukti persetujuan final yang sah secara visual kepada Satpam.  
* **Komponen:**  
  * **Background:** Putih bersih kontras tingkat tinggi untuk memastikan alat pemindai (scanner) satpam dapat membaca kode dengan sangat cepat.  
  * **Frame QR:** Kotak *Liquid Glass* yang kokoh di tengah layar. Di dalamnya terdapat gambar QR Code hitam-putih yang dicetak tajam.  
  * **Teks Status:** Di bawah kotak QR code terdapat teks besar yang berkedip halus (*pulsing animation*): "IZIN VALID \- SILAKAN KELUAR GERBANG", menegaskan keamanan sistem.

### **C. Modul Guru Piket**

**Page 5: Dashboard Guru Piket (/piket/dashboard)**

* **Fungsi:** Pusat komando (*command center*) untuk mengontrol shift kerja dan antrean tiket izin.  
* **Komponen:**  
  * **Shift Toggle Card (Top 38%):** Komponen fungsional terpenting\! Sebuah *Card* besar berbahan kaca buram berisi teks "Status Piket Hari Ini". Di sampingnya terdapat *Toggle Switch* mekanik raksasa yang seolah menonjol dari layar.  
    * *State Off:* Warna sakelar abu-abu redup dengan *inner shadow* (mati).  
    * *State On (Ready):* Saat digeser, sakelar berubah secara dinamis menyala Kuning \#EBD350 dan memancarkan cahaya (*outer glow*) ke sekelilingnya, menandakan "Gerbang tiket telah dibuka".  
  * **Approval Queue List (Bottom 62%):** Daftar tiket antrean. Desain *Card* memiliki dua tombol aksi geser (*swipe-to-action*) atau tombol aksi langsung: Ikon Ceklis menonjol (Approve) & Silang (Reject) untuk mempercepat birokrasi tanpa harus membuka detail setiap tiket.

### **D. Modul Wali Kelas**

**Page 6: Dashboard Wali Kelas (/wali/dashboard)**

* **Fungsi:** Pemantauan kondisi analitik kelas secara makro dan *approval* izin lapis pertama secara mikro.  
* **Komponen:**  
  * **Analitik Chart Header:** Menggunakan Grafik donat (Donut Chart) 3D dengan irisan (slices) yang tampak melayang. Ini menunjukkan metrik persentase siswa hadir vs izin di kelasnya. Irisan grafik menggunakan gradasi warna dari \#D0EB94 ke \#BAEB50. Jika satu irisan ditekan, ia akan menonjol keluar dan menampilkan angka spesifik.  
  * **List Tiket Kelas:** Sama dengan tampilan guru piket, tetapi eksklusif hanya memfilter anak didik kelas tersebut. Terdapat lencana tambahan yang mengindikasikan urutan birokrasi (contoh: "Menunggu Piket" atau "Selesai").

### **E. Modul Orang Tua**

**Page 7: Dashboard Orang Tua (/ortu/dashboard)**

* **Fungsi:** Dasbor pemantauan pasif yang dirancang untuk mengurangi kecemasan (*anxiety-free monitoring*) dengan tingkat kejelasan absolut.  
* **Komponen:**  
  * **Profil Anak Header:** Menampilkan foto/avatar anak berbingkai lingkaran kaca dan keterangan kelas.  
  * **Timeline Log (Komponen Utama):** Desain riwayat berbentuk *Timeline Vertikal*. Garis lurus di sisi kiri yang menghubungkan titik-titik (nodes) kejadian.  
    * Node untuk aksi yang *sudah terjadi* akan berwarna solid dengan garis penghubung hijau tegas. (Misal: *08:00 \- Budi mengajukan izin sakit.*)  
    * Node *sedang diproses* memiliki animasi pendar (*pulsing*). (Misal: *08:15 \- Disetujui Wali Kelas.*)  
    * Node *final* akan menampilkan ikon gembok terbuka berwarna Hijau Solid \#50EB63 (Misal: *08:20 \- Izin Valid (QR Terbit)*).

### **F. Modul Universal (Digunakan Bersama)**

**Page 8: Detail Tiket & Chat Room (/shared/ticket-detail)**

* **Fungsi:** Laman tunggal untuk meninjau informasi lengkap alasan izin sekaligus ruang diskusi mini (Thread) yang melekat secara permanen pada tiket tersebut.  
* **Komponen:**  
  * **Detail Section:** Panel lipat yang menampilkan teks narasi alasan secara penuh, informasi waktu, dan fitur untuk memperbesar (zoom) lampiran gambar dokumen medis/pendukung.  
  * **Chat Interface:** Menempati area bawah layar.  
    * *Bubble Chat:* Didesain sebagai kapsul *Liquid Glass* (transparan dengan blur latar).  
    * Balasan Siswa berada di kanan dengan *tint* warna \#D0EB94.  
    * Balasan Guru berada di kiri dengan *tint* warna \#BAEB50.  
    * Ditambahkan indikator stempel waktu (*timestamp*) kecil di bawah setiap gelembung.  
  * **Input Chat Bar:** Area pengetikan *Keyboard-avoiding* (naik otomatis saat keyboard muncul) di paling bawah dengan tombol *Send* bundar berwarna \#50EB63.

## **4\. Instruksi Prompt Tambahan untuk Agent Stitch (Copy-Paste)**

Jika Anda memasukkan dokumen cetak biru ini ke dalam kotak input alat AI (seperti Stitch atau v0), tempelkan baris instruksi direktif (*prompt*) berikut untuk hasil maksimal:

"Gunakan seluruh struktur arsitektur halaman dan alur komponen di atas untuk membangun antarmuka UI mobile menggunakan framework React Native (Expo) atau spesifik menggunakan Gluestack UI.

Anda **wajib** mengaplikasikan gaya desain **Skeuomorphism \+ Liquid Glass** pada setiap layar.

Warna utama (Primary/Success) adalah \#50EB63, sekunder (Secondary/Glass tint) \#79EB50, dan status peringatan (Warning/Pending) menggunakan \#EBD350. Background harus mengandalkan perpaduan Putih \#FFFFFF dan \#D0EB94.

Terapkan properti backdrop-filter: blur(15px) atau setara pada setiap komponen *Card*, dipadukan dengan *drop-shadow* tebal dan *border* putih transparan di atas/kiri (1px solid rgba(255,255,255,0.4)) untuk mensimulasikan efek pinggiran kaca tebal. Pastikan padding responsif dan gunakan tipografi font sans-serif dengan hierarki visual yang sangat jelas untuk mobile."

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAwCAYAAACsRiaAAAAC2klEQVR4Xu3cz4tVZRgHcIcxCEqNahqae+/ce2YGBiNtMVSLtMCVbVy0UXQh6iK3rdwGGYK7xJVEFiH9sIUiFf0AWwRhCK1cufE/aN9Gvw+eg7dDI824iOTzgYfzvs97zrnbL+97792yBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODx0zTNm+Px+EJXk8nko9Skf99Gzc3NPd3vAQCwSclnbyWs/Znr/kxn++sbtbKysj3v+7XfBwBgkxLU3k3AurWwsPB8f22zVldXt/V7AABsztaEtW8WFxcvZjzTX2zNLi8vv5Bg92SvPzMcDp9dW1t7Yrq5tLS0Y6o3OxgMnqtraqbGjksBADagdtVqdy11pL8WMwlpB7P2ea6HUp9l/E63mPG11PHU5dTPTdPMt/PTCYA/5JatuZ5KfZpnv0r/bK5H67h0NBodePAxAACsa53j0Np1O9EPchm/nbqTejHPvd/tlGX+Yepc7arVLlzG52u93lO9zC/V59S99Uzm1wU2AIB/5x+PQxOmXk7/cIWzpmle6fptMPuinqvdturNz88/lfGPXQAbDoeDzH/Pc7trXkGw5vmMPVPv/iPzpe69AACsozsO7Xa/Sn0nLb3LbbC6ORgMhtXPPZOErBsJYq/VPGsft/3XM76d2tnOD2X8Xe59qeZ5z6uZ/9bt4LVHpBe7QAcAwEMkSH2fuls7ZLleSJC6kutfqW/raDP1XvVTJzL+usJX92yC3a70P6l7U790x6O105b5T6kPal5hcNzuyrXzk/mcL1NnuncBAPAIKoglZD3T73fG7ffXpnvTvxJtg9/ffl3a/uXHI//fGwAA60gAOza5/z21ZLXxzdFotLd/DwAA/6GEtH0JbFfH93+w8EZ/HQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP437gFqv36JsoxYawAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAwCAYAAACsRiaAAAAFRUlEQVR4Xu3cW4huZRkH8G/Y2xBPtdXt1n2Y9c3Mhs1mQ0ZjeEgxyCDpcFEhioogal5EJJWReSGKWAYiXohgERkWldRF7S4s8ohnMG806CZBugkLhK688f/s713j68eMsxOrgX4/eFhrPe+71nrnu3p41lozmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8x20bhuEzicOJJxK/27dv31mJz89P3Ar27NlzynQ6fXhxcXF1fmyryW95MHFvxcrKymnz4wAAm0rhc3qKid9XQVGFUEsv5PgfW7Ugytq+nnhjq65vXtZ5Sdb7h127dh0/PwYA8K6Wl5c/WMVaCoobc7jQj1Wnbffu3af2ua0ia/tp4p9Z9+fmx7airPWexO3zeQCAzSxMp9O7E891nbU1KTBurTm1v7q6eszevXtPHo97O3fuPCHXOLb2s/1Qt39sHb9z9vtie9Z2XuLVxBf6gfH+/Tr6/Lg/5jdae7NQv0vN6XOJbbVTv8k6HbOFyveJAwcOnJjC8rGs9eI+DwCwqWH2btXria/Mj5WxGFlaWhpSyHw38w5ne2nlsn9udecydmb276xuXOt6fSfxm3r/rTpKLX9unVPnZv9nk1bwjKpISv7XiQdyuL0fW0+Kn/MTOzL/+Wy/NeZznQtzfEfyzySuqXtVB67PZ3tfjVV+o7W39+MuzP4vE5cn7srxDYcOHfpA9m9K/CS3296utfaYM3OmNZZ4sAq0lZWVfZUfZr/zn5JbHtcKAHBUqthJIfFaCpS9Yy5FzIHkfpt4OXF/dZeqIEn+wzl+MbE0mXW4Hqr5NZY65ewcP90/Pm35Tycer8KuFVhPZXvROOe9yPlX5Dp/zPZH2f491/9xG1qoe9ZHEsk/UolhVjAergJszI/dsjG/3tpbAbn2+LIVdn9N/pz6W6ataK3fbSwYk/vyMCsgd1Su1jdp3cjB41AA4L1qRczf1un81AcHD9Z2TLSCpIq07VXcVJHTdZbWxsb5pS9UhlmX6YUUPIs5/7h+3tGqjlWucfP4yLGKtfn71v0qqjDL9tHMuaXP1357DHokv97ac3zG0D2+HGZdtmfa+34Hx98r209W1H5byz1t/kN1TnXk9u/ff1J12+p603c+bgUA2Fz9i4kUEi+lkLi+zy8tLe1K/pU+17pGR7pJ2Z6fc57LnG9MWnFXhU8/v1QRs9g+CmhFz+Ecfzz5y+am1uPFr05b52oDdZ+bMu/QmBhmRdijY9dsLNIy55IUoxfUGqsL1udrXo21ruK6a6+CNHM+Vvuto/Zw5n2xjnON1cpV0Zj8DV3H7gfj75P9l9v9v5b4yDB7HLpa8yddEQwAcFRaQfHnxP0pKr6UuC77D9RxPy/5i6royfzrqzhJPFmPCqu4ydizQ3tPbe6ca5P/VStcqgNV/zrk+/0j2DLd5B225C8eZo9j30zcVp2rnPPtYfbRwb9yn/uq+5btco7/krFfJH6e/YN1fp/P9uoaq/y7rb1d46ph9h7cZyet0Gpdtm9m7HvZfnSc397Zq3f86vd5JHFXzvtUK4rr+M6MfWKcDwDw79pWRVSKivPa16LrdoGqsJq2Lyxrv6UX6ivI2r49823Vgeo7YN1577vxPbUqqibdevp8iqgd3diGa691bvRb1Ney81+Clsq1e29r113Lr/M1KQDA/59h9s7ckffIjiYPAMB/0TD7dxs/HGb/uuPKzfIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwP/cWIZo0bbBs5zYAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAAEoklEQVR4Xu3cS6hVVRgH8Hsxo3eZyU3v45x7uWUmFCEEShBIhA5sEA0CpcCelEk0iYIgqCisoExLogclIjWIooyiQSBhr0HRoIImBVI0bdSs/p9n7Tpe8t6Zl+T3g4+99nruM/tYa+8zMgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL6PV6axIvJl6empq6M1WjVT8+Pr686lpsmDPspMjzXN7v99/K+q+mvCXlm4eal6Ru2Uh7XgCAU1oSocuSFP2YOJqY7upT3j8zM3PpyCIkRUnGrsn6b2b98ycmJmZT/qnqhtpvqrrp6emx4XEAAKekJD4bkwDd1xK2HUP1Dwz3O1mSoJ2Ztd/pErQVK1ack/LrqR/v+qxbt27p2NjY2f+OAgA4RfX7/TOSDD1YyU+SpPWJP1K3qdpSPzPcNwnThanblz73JF5IfD09PX11mk5LeU87vtyV6625fpbr/bk+ndiecV/metUC83TrVML2fuKvxM+JlV1b+uW291ji0Jwj0tHU7UjcntiV+6VZ447Ek4mPa6euIm2f9Aa/c3NiTQ1c6HkAABZVJWWJnVWuRCnlj5KwHMx1WSVzXb9qy/17qd/Wxq1Lv+9rfCU+absrcbiSompP3e7cv107YSODZOpAYnu1nWiebq2yatWqi1L/eG+QsP0wPj4+0frfWeslDiW2dv1b3YdJtK7PdX8d81bfxHW5P1K/J21XpvxtzdWStzXz/a5ubgCARZXkZGNi89D9jYnf5+xeVSJTic8vXSIzOTl5Q+4/rePKSspSPlBJW7VVXbVVn7qv5CttX021I84TzdOWWrJ69epzW/mYtP+aWF/l2glM4nVF7r/pHf++XW291ZHuwax1cT1TJZy9wc7fo63P1t5gZ64S0dFK4ub7Xd3cAACLKonKzuHdpLbz9EWSmu/m9HtwKNmp5OeJiraDtmQ4Iav50vZtrx05pm1Tykfqy9Mkb2fNN0+NSdzWrdvGf9XNVdqzVCJ2RreDV8lX7vup/63X3r37j0TxlcTDVe4+Vljodw1WBABYJLWLlETlqf/Y0ap3wX6bU/dA+r5R5Uq8WhJVu3H3tuPLz+va+tb7Yf/sUqW8u5KgjLm2jiwXmKfKe0aGvkyt8bmcVuVKKDPmcCWBU4Pj0dpZq3fSjtaRZ+of6rfdwdStTHwxMTFxSSVkKR/KmC3VVuNbn3l/V3sEAICTrzdIqupY8c9KkGZnZ88baptOYrNvuH972f+DJDR39wb/2/ZBYm/63dLGHBxpSVX6PJr7J7qxKT+buudzfaQdl843T32k8GHuX5oa/HXHY917caV9Mfpu6p/pDd6JG6130lJ+LfXbct3dfT3ajmr3Zq3nau3+4KOI92vtqfbe3kK/CwDg/2b4z2pH287csZ2w2sHqOq1du/b0dqTYOa7vyInnGe12tTLfBUmcNkxOTq5qY/5Rcw8ncU0lbsvn1B1Tc3W7ffWcdT+ny4meBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABo/gZKySB9kxT9jAAAAABJRU5ErkJggg==>