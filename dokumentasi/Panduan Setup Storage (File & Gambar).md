# **Panduan Setup Supabase Storage untuk Lampiran Izin & Chat**

Dokumen ini memandu Anda untuk membuat dan mengonfigurasi *Bucket* di Supabase Storage, mengatur kebijakan keamanannya, dan menghubungkannya ke Backend Laravel sebagai *API Gateway*. Dokumen ini juga mencakup implementasi kompresi gambar di sisi klien (Mobile App) untuk optimasi performa.

## **Langkah 1: Membuat Bucket di Dashboard Supabase**

Kita akan membuat satu *bucket* publik yang di dalamnya akan dibagi menjadi dua folder otomatis (bukti\_izin/ dan chat\_attachments/).

1. Login ke **Dashboard Supabase**.  
2. Pilih proyek SiDispen Anda.  
3. Di menu navigasi sebelah kiri, klik ikon **Storage**.  
4. Klik tombol **New Bucket**.  
5. Isi konfigurasi berikut:  
   * **Name:** sidispen-attachments (Gunakan huruf kecil semua dan tanpa spasi).  
   * **Public bucket:** **Aktifkan (Toggle On)**.  
     *(Justifikasi: Membuatnya publik akan sangat mempermudah aplikasi mobile merender gambar tanpa perlu melakukan generate "Signed URL" yang rumit setiap kali membuka halaman riwayat izin/chat. Keamanannya dijamin oleh nama file yang menggunakan UUID acak, sehingga tidak bisa ditebak orang luar).*  
   * Klik **Save**.

## **Langkah 2: Konfigurasi Keamanan (Storage Policies)**

Meskipun *bucket* bersifat publik untuk **DIBACA** (Read), kita harus menguncinya agar hanya pengguna yang *login* yang bisa **MENGUNGGAH** (Write) file ke dalamnya.

1. Di halaman **Storage**, klik tab **Policies** (atau ikon gembok pada bucket sidispen-attachments).  
2. Pada bagian sidispen-attachments, klik **New Policy**.  
3. Pilih **For Full Customization**.  
4. Buat **Policy 1 (Untuk Membaca / SELECT):**  
   * **Policy Name:** Public Access to Images  
   * **Allowed Operation:** Centang **SELECT**  
   * **Target Roles:** Pilih anon dan authenticated  
   * **Policy definition:** bucket\_id \= 'sidispen-attachments'  
5. Klik tombol **Review** lalu **Save policy**.  
6. Buat lagi **Policy 2 (Untuk Mengunggah / INSERT):**  
   *(Klik New Policy \-\> For Full Customization lagi)*  
   * **Policy Name:** Hanya user login yang bisa upload  
   * **Allowed Operation:** Centang **INSERT**  
   * **Target Roles:** Pilih authenticated  
   * **Policy definition:** bucket\_id \= 'sidispen-attachments'  
7. Klik tombol **Review** lalu **Save policy**.

## **Langkah 3: Mendapatkan Kredensial S3 dari Supabase**

Agar Laravel bisa berkomunikasi dengan Supabase Storage layaknya server AWS S3, kita membutuhkan akses *keys*.

1. Di Dashboard Supabase, buka menu **Project Settings** (ikon Roda Gigi di kiri bawah).  
2. Di sidebar kiri, di bawah bagian *Configuration*, pilih **Storage**.  
3. Di bagian **S3 Connection**, Anda akan menemukan:  
   * **Endpoint** (contoh: https://\[PROJECT\_ID\].supabase.co/storage/v1/s3)  
   * **Region** (Sesuai lokasi server Anda, misal: ap-southeast-1)  
4. Klik tombol **New Access Key** untuk mendapatkan:  
   * **Access Key ID**  
   * **Secret Access Key** (Simpan baik-baik, ini hanya muncul sekali\!)

## **Langkah 4: Integrasi di Backend Laravel**

Karena Laravel bertindak sebagai *Gatekeeper* (pengaman), aplikasi *mobile* akan mengunggah gambar ke Laravel, lalu Laravel akan meneruskannya ke Supabase Storage.

### **A. Instalasi Driver S3**

Buka terminal di folder backend-api Anda dan jalankan:

composer require league/flysystem-aws-s3-v3 "^3.0"

### **B. Konfigurasi filesystems.php**

Buka file config/filesystems.php dan tambahkan *disk* Supabase di dalam *array* disks:

'disks' \=\> \[  
    // ... disk local dan public bawaan laravel

    'supabase' \=\> \[  
        'driver' \=\> 's3',  
        'key' \=\> env('SUPABASE\_S3\_ACCESS\_KEY\_ID'),  
        'secret' \=\> env('SUPABASE\_S3\_SECRET\_ACCESS\_KEY'),  
        'region' \=\> env('SUPABASE\_S3\_REGION', 'ap-southeast-1'),  
        'bucket' \=\> env('SUPABASE\_S3\_BUCKET'),  
        'endpoint' \=\> env('SUPABASE\_S3\_ENDPOINT'),  
        'use\_path\_style\_endpoint' \=\> true, // Wajib diaktifkan untuk Supabase  
        'visibility' \=\> 'public',  
    \],  
\],

### **C. Update .env Laravel**

Tambahkan kredensial yang Anda dapatkan di Langkah 3 ke dalam file .env:

FILESYSTEM\_DISK=supabase

SUPABASE\_S3\_ACCESS\_KEY\_ID=kunci\_access\_anda  
SUPABASE\_S3\_SECRET\_ACCESS\_KEY=kunci\_secret\_anda  
SUPABASE\_S3\_REGION=ap-southeast-1  
SUPABASE\_S3\_BUCKET=sidispen-attachments  
SUPABASE\_S3\_ENDPOINT=https://\[PROJECT\_ID\].supabase.co/storage/v1/s3

## **Langkah 5: Pembuatan Endpoint Upload di Laravel**

Kita perlu mengubah DispensasiController untuk menangani *file upload* saat siswa mengajukan form izin.

// app/Http/Controllers/Api/DispensasiController.php  
use Illuminate\\Support\\Str;  
use Illuminate\\Support\\Facades\\Storage;

public function store(Request $request)  
{  
    $request-\>validate(\[  
        'jenis\_izin' \=\> 'required|string',  
        'alasan' \=\> 'required|string',  
        'waktu\_mulai' \=\> 'required|date',  
        'waktu\_selesai' \=\> 'required|date',  
        'foto\_bukti' \=\> 'nullable|image|mimes:jpeg,png,jpg|max:5120', // Maks 5MB  
    \]);

    $siswa \= $request-\>user();  
      
    // 1\. Proses Upload Gambar jika ada  
    $lampiranUrl \= null;  
    if ($request-\>hasFile('foto\_bukti')) {  
        $file \= $request-\>file('foto\_bukti');  
        // Buat nama file acak berbasis UUID agar aman  
        $fileName \= (string) Str::uuid() . '.' . $file-\>getClientOriginalExtension();  
          
        // Simpan ke Supabase Storage di dalam folder 'bukti\_izin'  
        $path \= $file-\>storeAs('bukti\_izin', $fileName, 'supabase');  
          
        // Dapatkan URL publik penuh untuk disimpan di Database  
        // Format URL: https://\[PROJECT\_ID\].supabase.co/storage/v1/object/public/sidispen-attachments/bukti\_izin/namagambar.jpg  
        $lampiranUrl \= Storage::disk('supabase')-\>url($path);  
    }

    // 2\. Simpan Tiket ke Database  
    $tiket \= \\App\\Models\\DispensasiTicket::create(\[  
        // ... field lainnya ...  
        'lampiran\_bukti' \=\> $lampiranUrl, // Simpan URL gambar yang sudah jadi  
        'status' \=\> 'pending'  
    \]);

    // ... (Logika Push Notification) ...

    return response()-\>json(\['message' \=\> 'Tiket berhasil diajukan', 'data' \=\> $tiket\], 201);  
}

## **Langkah 6: Mengunggah Gambar & Kompresi dari Mobile App (Expo)**

Penting: Kita **wajib** menggunakan expo-image-manipulator untuk memastikan file dikompresi (\< 1MB) di perangkat pengguna *sebelum* dikirim ke API Laravel.

### **Mengapa Harus Dikompresi di Frontend?**

* **Efisiensi Biaya & Storage:** Menghindari limit gratis Supabase Storage dengan cepat.  
* **Beban Server Berkurang:** Laravel tidak perlu mengalokasikan RAM tinggi untuk memproses (*resize*) gambar beresolusi tinggi (misal 12MP dari kamera asli).  
* **User Experience (UX):** Upload tetap cepat dan stabil meskipun sinyal internet di sekolah sedang lemah (H+/3G).

### **A. Instalasi Pustaka (Terminal Mobile App)**

npx expo install expo-image-picker expo-image-manipulator expo-file-system

### **B. Membuat Fungsi Helper Kompresi**

Buat file src/utils/imageHelper.ts agar fungsi ini bisa digunakan kembali (reusable) di Form Pengajuan maupun di dalam Chat.

import \* as ImageManipulator from 'expo-image-manipulator';  
import \* as FileSystem from 'expo-file-system';

export const compressImage \= async (uri: string) \=\> {  
  try {  
    // 1\. Dapatkan info ukuran awal file  
    const fileInfo \= await FileSystem.getInfoAsync(uri);  
      
    // Jika ukuran sudah di bawah 1MB (\~1.048.576 bytes), tidak perlu kompresi berat  
    if (fileInfo.exists && fileInfo.size \< 1000000\) {  
      return uri;  
    }

    // 2\. Lakukan Manipulasi: Resize & Compress  
    const result \= await ImageManipulator.manipulateAsync(  
      uri,  
      \[{ resize: { width: 1200 } }\], // Kecilkan lebar ke 1200px (tinggi menyesuaikan otomatis, proporsional)  
      {   
        compress: 0.7, // Kualitas 70%, ukuran turun drastis tapi gambar tetap tajam dan bisa dibaca  
        format: ImageManipulator.SaveFormat.JPEG   
      }  
    );

    return result.uri;  
  } catch (error) {  
    console.error("Gagal kompresi gambar:", error);  
    return uri; // Kembalikan ke URI original jika terjadi kegagalan proses manipulasi  
  }  
};

### **C. Implementasi pada Form Pengajuan**

Terapkan fungsi kompresi pada logika pemilihan gambar sebelum datanya dibungkus ke dalam FormData.

import \* as ImagePicker from 'expo-image-picker';  
import { useState } from 'react';  
import { Platform } from 'react-native';  
import api from '../utils/api'; // Axios instance  
import { compressImage } from '../utils/imageHelper';

export default function PengajuanForm() {  
  const \[imageUri, setImageUri\] \= useState\<string | null\>(null);

  // 1\. Fungsi Memilih Gambar & Eksekusi Kompresi  
  const pickImage \= async () \=\> {  
    const result \= await ImagePicker.launchImageLibraryAsync({  
      mediaTypes: ImagePicker.MediaTypeOptions.Images,  
      allowsEditing: true, // Biarkan user melakukan crop  
      quality: 1, // Tarik gambar dengan kualitas maksimal dari galeri terlebih dahulu  
    });

    if (\!result.canceled) {  
      const originalUri \= result.assets\[0\].uri;  
        
      // PROSES KOMPRESI (Sebelum disimpan ke state)  
      const compressedUri \= await compressImage(originalUri);  
        
      setImageUri(compressedUri);  
    }  
  };

  // 2\. Fungsi Kirim Data ke Laravel  
  const submitPengajuan \= async () \=\> {  
    try {  
      // Wajib menggunakan FormData untuk mengirim gambar via HTTP POST  
      const formData \= new FormData();  
      formData.append('jenis\_izin', 'sakit');  
      formData.append('alasan', 'Demam tinggi dan flu');  
      formData.append('waktu\_mulai', '2026-05-10 07:00:00');  
      formData.append('waktu\_selesai', '2026-05-10 15:00:00');

      // Memformat gambar agar bisa dibaca oleh Laravel  
      if (imageUri) {  
        const filename \= imageUri.split('/').pop();  
        const match \= /\\.(\\w+)$/.exec(filename || '');  
        const type \= match ? \`image/${match\[1\]}\` : \`image\`;

        formData.append('foto\_bukti', {  
          uri: Platform.OS \=== 'ios' ? imageUri.replace('file://', '') : imageUri,  
          name: filename,  
          type,  
        } as any);  
      }

      // 3\. Tembak endpoint menggunakan Axios dengan header multipart  
      const response \= await api.post('/dispensasi', formData, {  
        headers: { 'Content-Type': 'multipart/form-data' },  
      });

      alert('Berhasil diajukan\!');  
    } catch (error) {  
      console.error(error);  
      alert('Gagal mengunggah pengajuan.');  
    }  
  };

  // ... (Render UI Form Skeuo-Glass) ...  
}

## **Analisis Arsitektural Pendekatan Ini**

Dengan pendekatan alur **Mobile App (Compress) \-\> Laravel (Gatekeeper) \-\> Supabase Storage**:

1. **Efisiensi End-to-End:** Proses kompresi di tingkat perangkat genggam memastikan ukuran *payload* jaringan yang seminimal mungkin, menghemat kuota siswa dan kapasitas *bandwidth* server API.  
2. **Keamanan Ekstra:** Laravel tetap bertindak sebagai filter akhir. Validasi Laravel (max:5120 dan cek mimes) memastikan bahwa file yang lolos memang merupakan format gambar yang sah, memitigasi risiko file berbahaya diunggah secara langsung ke *bucket* Supabase.  
3. **Kerapian Database:** URL *file* final yang dihasilkan oleh protokol S3 Supabase secara otomatis ditangkap oleh Laravel dan langsung disuntikkan ke tabel PostgreSQL dalam satu siklus kode (transaction) yang aman.