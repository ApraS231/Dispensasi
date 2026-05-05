# SiDispen Technical Documentation

Dokumentasi ini menjelaskan berbagai library, tool, dan teknologi yang digunakan dalam proyek SiDispen beserta kegunaannya masing-masing.

## 1. Core Frameworks & Platforms

| Tool / Library | Kegunaan |
| :--- | :--- |
| **React Native** | Framework utama untuk membangun aplikasi mobile native menggunakan JavaScript/TypeScript. |
| **Expo** | Platform dan toolkit yang mempercepat pengembangan React Native dengan menyediakan akses mudah ke API native (Camera, Notifications, dll). |
| **Expo Router** | Library navigasi berbasis file-system (mirip Next.js) untuk mengatur alur perpindahan halaman aplikasi. |
| **TypeScript** | Superset JavaScript yang memberikan sistem tipe statis untuk mencegah error selama pengembangan dan meningkatkan kualitas kode. |

## 2. UI & Design (Skeuomorphism Liquid-Glass)

| Tool / Library | Kegunaan |
| :--- | :--- |
| **React Native Reanimated** | Library animasi performa tinggi yang digunakan untuk menciptakan efek skeuomorphic, transisi halus, dan latar belakang liquid yang dinamis. |
| **Expo Blur** | Digunakan untuk menciptakan efek kaca (Glassmorphism) pada kartu (SkeuCard) dan bar navigasi. |
| **Expo Linear Gradient** | Digunakan untuk membuat gradasi warna yang memberikan kedalaman (depth) pada desain skeuomorphic. |
| **Expo Vector Icons** | Menyediakan akses ke ribuan ikon (MaterialCommunityIcons, Ionicons, dll) untuk kebutuhan visual. |
| **Expo Google Fonts** | Integrasi font kustom (Roboto, Nunito) untuk tipografi yang konsisten. |
| **React Native SVG** | Digunakan untuk merender grafik vektor kustom, seperti kurva liquid dan chart. |

## 4. Data Management & Networking

| Tool / Library | Kegunaan |
| :--- | :--- |
| **TanStack Query (React Query)** | Library state management untuk data asinkron. Menangani fetching data, caching (agar data tidak lambat), sinkronisasi, dan background updates. |
| **Axios** | HTTP Client untuk melakukan request ke server (backend API). |
| **Zustand** | Library state management yang ringan untuk menyimpan data global aplikasi seperti informasi User dan status Login. |
| **Expo Secure Store** | Digunakan untuk menyimpan Token Autentikasi secara aman di memori HP agar user tidak perlu login berulang kali. |

## 5. Features & Utilities

| Tool / Library | Kegunaan |
| :--- | :--- |
| **Expo Notifications** | Mengelola push notifications agar user mendapatkan info real-time saat ada izin baru. |
| **Expo Haptics** | Memberikan umpan balik getaran (haptic feedback) saat user menekan tombol, memberikan kesan fisik (tactile) pada aplikasi. |
| **React Native QRCode SVG** | Digunakan untuk menghasilkan kode QR yang akan dipindai oleh guru piket. |
| **Expo Camera** | Digunakan oleh Guru Piket untuk memindai kode QR siswa. |
| **Expo Brightness** | Secara otomatis mencerahkan layar HP saat menampilkan kode QR agar mudah dipindai. |

## 6. Backend & Auth Architecture

| Teknologi | Kegunaan |
| :--- | :--- |
| **Supabase Auth** | Sistem autentikasi utama untuk login siswa, guru, dan orang tua. |
| **Supabase Client** | Digunakan untuk interaksi data real-time dan penyimpanan state autentikasi. |
| **Laravel API** | Framework PHP yang menangani logika bisnis kompleks dan integrasi sistem sekolah. |
| **Laravel Filament** | Dashboard Admin berbasis web yang digunakan oleh pihak sekolah untuk mengelola data master. |
| **MySQL / PostgreSQL** | Database utama untuk menyimpan data terstruktur aplikasi. |

---

> [!NOTE]
> Arsitektur aplikasi ini menggunakan pendekatan **Service-Oriented**, di mana logika API dipisahkan dari komponen UI untuk memudahkan pemeliharaan jangka panjang.
