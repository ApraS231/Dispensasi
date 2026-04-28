---
name: SiDispen Skeuo-Glass Design System
colors:
  surface: '#f5fceb'
  surface-dim: '#d5ddcc'
  surface-bright: '#f5fceb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff6e5'
  surface-container: '#e9f0df'
  surface-container-high: '#e3ebda'
  surface-container-highest: '#dee5d4'
  on-surface: '#171d13'
  on-surface-variant: '#3f4a38'
  inverse-surface: '#2b3227'
  inverse-on-surface: '#ecf3e2'
  outline: '#6f7b66'
  outline-variant: '#becbb3'
  surface-tint: '#1f6d00'
  primary: '#1f6d00'
  on-primary: '#ffffff'
  primary-container: '#79eb50'
  on-primary-container: '#1d6800'
  inverse-primary: '#6edf46'
  secondary: '#4b6700'
  on-secondary: '#ffffff'
  secondary-container: '#bff055'
  on-secondary-container: '#4e6c00'
  tertiary: '#805159'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffc2cb'
  on-tertiary-container: '#7b4d55'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8afd5f'
  primary-fixed-dim: '#6edf46'
  on-primary-fixed: '#052100'
  on-primary-fixed-variant: '#165200'
  secondary-fixed: '#c2f357'
  secondary-fixed-dim: '#a7d63d'
  on-secondary-fixed: '#141f00'
  on-secondary-fixed-variant: '#384e00'
  tertiary-fixed: '#ffd9de'
  tertiary-fixed-dim: '#f3b7c0'
  on-tertiary-fixed: '#321018'
  on-tertiary-fixed-variant: '#653a42'
  background: '#f5fceb'
  on-background: '#171d13'
  surface-variant: '#dee5d4'
  bg-base: '#FFFFFF'
  bg-tint: '#D0EB94'
  accent-action: '#50EB63'
  accent-status: '#EBD350'
  accent-warning: '#EBE650'
  glass-border: rgba(255, 255, 255, 0.4)
  glass-highlight: rgba(255, 255, 255, 0.8)
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  top-area-ratio: 38%
  bottom-area-ratio: 62%
  base-unit: 8px
  gutter: 16px
  margin: 24px
---

# **Dokumentasi UI/UX Sistem Dispensasi (SiDispen)**

**Pendekatan Desain: Golden Ratio & Skeuo-Glass (Skeuomorphism \+ Liquid Glass)**

Dokumen ini merupakan panduan antarmuka (UI) dan pengalaman pengguna (UX) untuk aplikasi mobile dan web SiDispen. Desain ini menggunakan proporsi matematis *Golden Ratio* dan menggabungkan dua gaya visual: taktil dari *Skeuomorphism* dengan estetika tembus pandang dari *Liquid Glass*.

## **1\. Filosofi Gaya Visual: "Skeuo-Glass"**

Gaya **Skeuo-Glass** menggabungkan dua elemen:

1. **Skeuomorfisme (Tactile/Fisik):** Elemen UI didesain menyerupai objek dunia nyata (seperti tombol fisik yang bisa ditekan, kertas tiket yang menonjol, atau sakelar mekanik) menggunakan bayangan dalam (*inner shadow*), *bevel*, dan *drop shadow* tebal untuk memberikan kesan 3 Dimensi (3D) dan kedalaman.  
2. **Liquid Glass (Glassmorphism):** Material dari objek-objek 3D tersebut seolah-olah terbuat dari kaca buram (*frosted glass*). Menggunakan latar belakang tembus pandang (*translucency*), efek *background blur*, dan pantulan cahaya (*specular highlight*) di tepi atas komponen.

Efek psikologis: Memberikan kesan aplikasi yang sangat modern, bersih, namun tetap memberikan umpan balik fisik (taktil) yang memuaskan bagi pengguna saat disentuh.

## **2\. Palet Warna & Golden Ratio (Aturan 60-30-10)**

Komposisi warna disebar berdasarkan Teori *Golden Ratio* agar mata pengguna tidak cepat lelah dan fokus tertuju pada tombol aksi.

* **60% Dominan (Latar Belakang / Ruang Kosong):**  
  * **Warna:** Putih bersih (\#FFFFFF) & Hijau Pudar (\#D0EB94).  
  * **Penggunaan:** Latar belakang utama aplikasi. Memberikan kanvas yang terang agar efek pantulan kaca cair (Liquid Glass) pada komponen di atasnya dapat terlihat jelas.  
* **30% Sekunder (Struktur, Kaca, Navigasi):**  
  * **Warna:** Hijau Segar (\#79EB50) & Hijau Kapur (\#BAEB50).  
  * **Penggunaan:** Digunakan sebagai efek *tint* (pewarnaan) pada material kaca tembus pandang, *App Bar*, garis batas (*border* cahaya kaca), dan *Bottom Navigation*.  
* **10% Aksen (Focal Point & Status):**  
  * **Warna:** Hijau Terang (\#50EB63) & Kuning Keemasan (\#EBD350 / \#EBE650).  
  * **Penggunaan:** Hanya digunakan untuk tombol CTA (*Call to Action*), sakelar mekanik (Toggle), dan lencana status. Warnanya dibuat sangat solid/menyala (neon) untuk memandu mata pengguna di titik *Golden Spiral*.

## **3\. Tata Letak (Golden Ratio Layout)**

Untuk layar *smartphone* vertikal, layar dibagi berdasarkan titik fokus *Golden Ratio* (rasio 1 : 1.618):

* **Top Area (38%):** Digunakan untuk Header, identitas pengguna, dan ringkasan data. Memiliki gaya visual *Liquid Glass Card* yang mengambang.  
* **Bottom Area (62%):** Area interaktif utama untuk *scroll* daftar (List) tiket dispensasi.  
* **Titik Aksi (Focal Intersection):** Tombol aksi terpenting (seperti "Ajukan Izin" atau "Ready") diletakkan pada titik potong kurva rasio emas, biasanya di kuadran kanan bawah layar.

## **4\. Implementasi UI/UX Berdasarkan Role (Peran)**

### **A. Role: Siswa (Aplikasi Mobile)**

*Fokus UX: Navigasi intuitif dengan umpan balik taktil saat mengajukan izin.*

* **Dashboard (Golden Layout):** Latar belakang bergradasi putih ke \#D0EB94. Di area atas (38%), terdapat panel profil berbahan *Liquid Glass* tebal (kaca tembus pandang dengan efek blur latar belakang dan garis batas putih tipis di atasnya).  
* **Tiket Dispensasi (Skeuo-Glass):** Daftar tiket di area bawah (62%) didesain seperti selembar kertas fisik yang dibungkus dalam blok kaca akrilik tebal. Terdapat bayangan (*drop shadow*) tebal di bawah tiket yang memberikan ilusi tiket tersebut "melayang" dari layar.  
  * Status "Pending": Terdapat "lampu LED" virtual berwarna Kuning (\#EBD350) yang tampak menyala dari dalam kaca.  
  * Status "Disetujui": Lampu berubah menjadi Hijau Terang (\#50EB63).  
* **Tombol Pengajuan (Focal Point):** Tombol *Floating Action Button* di kanan bawah didesain seperti tombol fisik dari kaca solid berwarna \#50EB63. Saat ditekan, tombol memberi animasi *deboss* (melesak ke dalam layar).  
* **Halaman QR Code:** QR Code dicetak di atas panel *Liquid Glass* yang menyerupai ID Card fisik yang dikalungkan, memantulkan cahaya holografis lembut saat di-*scroll*.

### **B. Role: Guru Piket (Aplikasi Mobile)**

*Fokus UX: Visibilitas antrean dan kontrol Shift yang terasa "nyata".*

* **Sakelar Shift / Tombol Ready (Skeuomorfisme Kuat):** Di bagian atas layar (38%), terdapat elemen UI paling penting. Tombol "Ready" tidak sekadar tombol datar, melainkan didesain seperti **sakelar mekanik/slider fisik** berbahan kaca tebal.  
  * Saat *Off*: Slider meredup, dengan indikator *inner shadow* tebal.  
  * Saat ditekan/digeser ke *On* (Ready): Sakelar menyala (efek *neon glow* memancar dari balik kaca) dengan warna Kuning (\#EBD350), menandakan guru tersebut aktif menerima tiket.  
* **Aksi Approval (Liquid Glass):** Tiket masuk berada di area bawah (62%). Tombol "Approve" menggunakan desain tombol fisik *emboss* (menonjol). Warna dasarnya \#BAEB50, namun jika status tiket *urgent*, tombol tersebut berkedip lembut.

### **C. Role: Wali Kelas (Aplikasi Mobile)**

*Fokus UX: Pemantauan analitik yang mudah dicerna dan fungsi komunikasi/chat.*

* **Header Analitik (Golden Ratio 38%):** Menampilkan *Pie Chart* 3 Dimensi. Potongan grafik terbuat dari material *Liquid Glass* berwarna gradasi palet (dari \#D0EB94 ke \#50EB63). Grafik ini seolah-olah diletakkan di atas piringan kaca.  
* **Fitur Chat (Skeuo-Glass Bubble):** Gelembung obrolan (*chat bubble*) didesain seperti kapsul kaca transparan yang berisi cairan warna. Pesan masuk memiliki tinta kaca kebiruan/netral, sedangkan pesan balasan guru berwarna Hijau Segar (\#79EB50) dengan efek cembung di tengahnya.

### **D. Role: Orang Tua (Aplikasi Mobile)**

*Fokus UX: Ketenangan, minimalis, dan timeline yang mudah dipahami.*

* **Timeline Riwayat:** Menggunakan desain *Skeuomorphism* berupa kawat baja tipis vertikal di sebelah kiri layar. Setiap "titik" kejadian (mengajukan, disetujui, keluar gerbang) direpresentasikan oleh "kelereng kaca" (*glass beads*).  
  * Kelereng akan menyala dengan warna aksen \#50EB63 jika tahapan tersebut sudah dilewati anak.  
* **Latar Belakang:** Area 60% dominan menggunakan warna dasar \#D0EB94 pucat yang memberikan efek rileks dan tidak memancing kepanikan orang tua saat melihat laporan log absensi/izin anaknya.

## **5\. Ringkasan Elemen Visual Tambahan**

1. **Tipografi:** Gunakan font *Sans-Serif* geometris yang bersih (seperti *Inter* atau *Poppins*) untuk mengimbangi kompleksitas bayangan/kaca dari komponen UI.  
2. **Efek Kedalaman (Z-Index):**  
   * Latar Belakang Dasar: Elevasi 0 (Datar).  
   * Panel / Kertas Tiket: Elevasi 1 (Kaca buram, drop shadow menyebar tipis).  
   * Tombol Aksi & Notifikasi: Elevasi 3 (Kaca solid, drop shadow pekat dan tajam di bawahnya, highlight putih di atasnya).  
3. **Micro-interaction:** Setiap interaksi dengan tombol *Skeuo-Glass* harus disertai efek getar halus pada *smartphone* (Haptic Feedback) untuk menyempurnakan ilusi fisik.