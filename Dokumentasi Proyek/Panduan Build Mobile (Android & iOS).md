# Panduan Build Aplikasi Mobile SiDispen (Android & iOS)

Dokumen ini menjelaskan langkah-langkah teknis untuk mengompilasi (build) aplikasi SiDispen menjadi file instalasi (.apk/.aab untuk Android) atau untuk distribusi iOS menggunakan **EAS (Expo Application Services)**.

---

## 🛠️ Persiapan Awal

Sebelum melakukan build, pastikan Anda telah memiliki:
1. Akun di [expo.dev](https://expo.dev/).
2. Node.js terinstal di komputer Anda.
3. Alamat API Backend yang sudah *live* (misal: dari DOM Cloud).

### 1. Instalasi EAS CLI
Buka terminal dan jalankan perintah berikut untuk menginstal alat build Expo secara global:
```bash
npm install -g eas-cli
```

### 2. Login ke Akun Expo
Masuk ke akun Anda melalui terminal:
```bash
eas login
```

### 3. Inisialisasi Proyek EAS
Di dalam direktori `mobile-app`, jalankan:
```bash
eas build:configure
```
*Pilih "All" untuk mengonfigurasi Android dan iOS sekaligus.*

---

## ⚙️ Konfigurasi Build (`eas.json`)

Buka file `eas.json` yang baru tercipta. Pastikan konfigurasinya mendukung pembuatan file APK (untuk Android) agar mudah dibagikan tanpa Play Store selama tahap pengujian.

Sesuaikan bagian `build` seperti ini:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

---

## 🚀 Langkah-Langkah Build

### 1. Perbarui Environment Variable
Pastikan file `.env` di folder `mobile-app` menggunakan URL API produksi:
```env
EXPO_PUBLIC_API_URL=https://nama-proyek-anda.domcloud.dev/api
EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_...
```

### 2. Build untuk Android (.apk)
Untuk menghasilkan file APK yang bisa langsung diinstal di HP Android:
```bash
eas build -p android --profile preview
```
*Tunggu proses selesai. Setelah selesai, Anda akan diberikan link download untuk file .apk tersebut.*

### 3. Build untuk Android (.aab - Play Store)
Jika ingin merilis ke Google Play Store:
```bash
eas build -p android --profile production
```

### 4. Build untuk iOS
> **Catatan:** Build untuk iOS memerlukan akun **Apple Developer Program** ($99/tahun) jika ingin menginstal di perangkat fisik atau App Store.

**Untuk Simulator (Pengujian):**
```bash
eas build -p ios --profile preview
```

**Untuk App Store (Produksi):**
```bash
eas build -p ios --profile production
```

---

## 🔑 Manajemen Kredensial

EAS akan menangani pembuatan sertifikat keamanan secara otomatis:
- **Android:** EAS akan membuat *Keystore*. Anda bisa membiarkan EAS mengelolanya atau mengunggah milik sendiri.
- **iOS:** Anda akan diminta masuk ke akun Apple Developer untuk meng-generate *Distribution Certificate* dan *Provisioning Profile*.

---

## 📄 Ringkasan Perintah Penting

| Perintah | Tujuan |
|---|---|
| `eas build:list` | Melihat daftar build yang sedang berjalan atau sudah selesai. |
| `eas build:view` | Melihat detail build tertentu. |
| `eas credentials` | Mengelola sertifikat keamanan (Keystore/p12). |
| `npx expo start` | Menjalankan aplikasi di mode development (Expo Go). |

---

**Status:** Dokumentasi ini siap digunakan untuk mendampingi pelaksanaan Fase 7.
