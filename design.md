# **Dokumen Spesifikasi Desain (design.md)**

**Gaya Desain:** Skeuo-Glass (Skeuomorphism \+ Glassmorphism)

**Prinsip Tata Letak:** Rasio Emas (Golden Ratio)

**Platform:** Aplikasi Seluler (Mobile App)

**Versi:** 1.0.0

## **1\. Filosofi & Batasan Desain Pokok**

Sistem ini menggabungkan kedalaman fisik dan realisme taktil dari skeuomorphism dengan material kaca buram dari glassmorphism. Elemen tidak boleh terlihat datar (flat). Semua proporsi ruang, margin, dan tipografi harus tunduk pada rasio emas.

**Parameter Keberhasilan Global (Anti-Halusinasi):**

* \[ \] Agen dilarang menggunakan warna solid (alpha 100%) untuk komponen antarmuka yang melayang (seperti kartu atau tombol). Semua permukaan harus menggunakan format rgba dengan nilai alpha maksimum 0.4.  
* \[ \] Agen wajib menyertakan properti backdrop-filter: blur(...) pada setiap komponen kontainer utama.  
* \[ \] Tidak ada desain bersudut tajam. Semua komponen interaktif harus memiliki border-radius.

## **2\. Sistem Tata Letak dan Matematika Rasio Emas**

Semua skala jarak dan proporsi mengacu pada konstanta rasio emas, direpresentasikan dengan:

Phi \= 1.618

### **A. Skala Jarak (Spacing Scale)**

Menggunakan ukuran dasar 8px, dikalikan dengan rasio emas (dibulatkan ke piksel terdekat):

* spacing-xs : 8px  
* spacing-sm : 13px (8 \* 1.618)  
* spacing-md : 21px (13 \* 1.618)  
* spacing-lg : 34px (21 \* 1.618)  
* spacing-xl : 55px (34 \* 1.618)

### **B. Proporsi Layar Vertikal**

Layar dibagi menjadi dua segmen utama berdasarkan persentase rasio emas:

* **Area Konten (Fokus Utama):** Tinggi 61.8% dari total viewport (62vh).  
* **Area Navigasi & Aksi:** Tinggi 38.2% dari total viewport (38vh).

**Parameter Keberhasilan Tata Letak:**

* \[ \] Padding dan margin hanya boleh menggunakan nilai dari Skala Jarak di atas (8px, 13px, 21px, 34px, 55px).  
* \[ \] Agen tidak boleh menggunakan angka acak seperti 10px, 15px, atau 20px untuk jarak antar elemen.

## **3\. Desain Sistem Token**

### **A. Tipografi Modular**

Dasar ukuran teks adalah 16px.

* text-body: 16px (Font Weight: 400\)  
* text-h3: 21px (Font Weight: 500\)  
* text-h2: 26px (16 \* 1.618) (Font Weight: 600\)  
* text-h1: 42px (26 \* 1.618) (Font Weight: 700\)  
* text-caption: 10px (16 / 1.618) (Font Weight: 400\)

### **B. Palet Material Kaca (Glass Palette)**

* **Background Aplikasi:** Gradien linear \#1A1A24 ke \#0D0D14.  
* **Permukaan Kaca (Surface):** rgba(255, 255, 255, 0.08)  
* **Highlight Tepi (Edge Light):** rgba(255, 255, 255, 0.45)  
* **Bayangan Tepi (Edge Shadow):** rgba(0, 0, 0, 0.6)  
* **Bayangan Jatuh (Drop Shadow):** rgba(0, 0, 0, 0.35)

**Parameter Keberhasilan Token:**

* \[ \] Agen wajib mengimplementasikan token ini sebagai CSS Variables (:root) atau format setara dalam framework yang digunakan.  
* \[ \] Ukuran font dilarang menyimpang dari skala modular yang disebutkan di atas.

## **4\. Spesifikasi Komponen Mendetail**

### **A. Tombol Aksi Utama (Primary Button)**

Tombol merepresentasikan tombol fisik berlapis kaca tebal.

* **Bentuk:** Tinggi minimal 55px (spacing-xl). Lebar menyesuaikan grid dengan border-radius: 13px.  
* **Efek Visual (Default State):**  
  * background: Permukaan Kaca.  
  * backdrop-filter: blur(12px).  
  * border-top: 1px solid Highlight Tepi.  
  * border-bottom: 1px solid Bayangan Tepi.  
  * box-shadow: 0px 13px 21px rgba(0, 0, 0, 0.35) (Kedalaman Skeuomorphic).  
* **Efek Visual (Pressed/Active State):**  
  * transform: scale(0.98) atau translateY(4px).  
  * box-shadow: Berubah menjadi inner shadow untuk mensimulasikan tombol yang tertekan secara mekanis \-\> inset 0px 8px 13px rgba(0, 0, 0, 0.5).

**Parameter Keberhasilan Tombol:**

* \[ \] Terdapat dua jenis bayangan sekaligus pada state default: border transparan untuk tekstur tepi kaca, dan box-shadow luar untuk elevasi fisik.  
* \[ \] Transisi state (default ke pressed) diatur ke 200ms ease-in-out untuk meniru resistensi pegas fisik.

### **B. Kartu Informasi (Glass Card)**

Wadah untuk mengelompokkan konten (misalnya widget dashboard).

* **Proporsi:** Jika memungkinkan, rasio lebar berbanding tinggi adalah 1 berbanding 1.618.  
* **Bentuk:** border-radius: 21px. padding: 21px.  
* **Efek Visual:**  
  * background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%).  
  * backdrop-filter: blur(24px).  
  * border: 1px solid rgba(255,255,255,0.2) di bagian atas/kiri.

**Parameter Keberhasilan Kartu:**

* \[ \] Agen wajib menerapkan background berwujud linear-gradient diagonal pada kartu untuk mensimulasikan arah datangnya cahaya dari sudut kiri atas.  
* \[ \] Teks di dalam kartu harus memiliki rasio kontras yang cukup terhadap latar belakang yang di-blur.

### **C. Kolom Input (Text Field)**

Lubang atau ceruk fisik yang digali ke dalam panel kaca.

* **Bentuk:** Tinggi 55px. border-radius: 13px.  
* **Efek Visual (Default State):**  
  * background: rgba(0, 0, 0, 0.25) (Menggelap ke dalam).  
  * box-shadow (Inner): inset 0px 8px 13px rgba(0, 0, 0, 0.6), inset 0px \-1px 2px rgba(255, 255, 255, 0.15).  
  * border: Tidak ada border luar yang solid, kedalaman dibentuk sepenuhnya oleh bayangan dalam.

**Parameter Keberhasilan Kolom Input:**

* \[ \] Agen dilarang menggunakan drop-shadow (bayangan luar) pada elemen input teks. Input teks HANYA menggunakan inset box-shadow (bayangan dalam).

## **5\. Instruksi Eksekusi Agen (System Prompting Guard)**

Bagi agen AI yang membaca dokumen ini untuk menulis kode:

1. Baca seluruh parameter keberhasilan sebelum menghasilkan baris kode pertama.  
2. Lakukan validasi mandiri: "Apakah margin ini sesuai dengan skala jarak rasio emas (8, 13, 21, 34, 55)?"  
3. Lakukan validasi mandiri: "Apakah tombol ini memiliki efek taktil (border highlight dan drop shadow) sekaligus efek kaca (backdrop blur dan background semi-transparan)?"  
4. Jika ada konflik antara standar komponen bawaan framework dengan design.md ini, maka dokumen ini yang **WAJIB** diutamakan.