# **Panduan Teknis Detail \- Fase 4: Pengembangan Aplikasi Mobile (Expo)**

Fase ini berfokus pada pembangunan antarmuka aplikasi Android/iOS untuk pengguna harian: **Siswa, Guru Piket, Wali Kelas, dan Orang Tua**. Kita menggunakan Expo Router untuk navigasi berbasis file (*file-based routing*), Axios untuk komunikasi API, dan SecureStore untuk penyimpanan token yang aman.

## **Langkah 1: Instalasi Dependensi Tambahan**

Pastikan terminal Anda berada di dalam folder mobile-app. Kita membutuhkan beberapa pustaka tambahan.

\# Untuk pemanggilan API ke Laravel  
npm install axios

\# Untuk state management global (simpan data user yang sedang login)  
npm install zustand

\# Untuk menyimpan Token API secara aman di device  
npx expo install expo-secure-store

\# Untuk merender QR Code secara native  
npm install react-native-qrcode-svg

## **Langkah 2: Konfigurasi Axios & Secure Store**

Kita perlu membuat *helper* API (interceptor) agar setiap kali aplikasi melakukan *request* ke Laravel, ia otomatis menyertakan Token Akses (Sanctum) yang disimpan di perangkat.

1. Buat folder src/utils/ dan buat file api.ts.

// src/utils/api.ts  
import axios from 'axios';  
import \* as SecureStore from 'expo-secure-store';

const api \= axios.create({  
  baseURL: process.env.EXPO\_PUBLIC\_API\_URL, // Ambil dari .env  
  headers: {  
    'Content-Type': 'application/json',  
    'Accept': 'application/json'  
  }  
});

// Interceptor untuk menyematkan Token otomatis  
api.interceptors.request.use(async (config) \=\> {  
  const token \= await SecureStore.getItemAsync('userToken');  
  if (token) {  
    config.headers.Authorization \= \`Bearer ${token}\`;  
  }  
  return config;  
});

export default api;

## **Langkah 3: State Management (Zustand)**

Buat *store* untuk mendeteksi apakah *user* sudah login dan apa *role*\-nya. Ini penting untuk navigasi dinamis.

Buat file src/stores/authStore.ts:

// src/stores/authStore.ts  
import { create } from 'zustand';

interface User {  
  id: string;  
  name: string;  
  role: 'siswa' | 'guru\_piket' | 'wali\_kelas' | 'orang\_tua';  
}

interface AuthState {  
  user: User | null;  
  setUser: (user: User | null) \=\> void;  
  isLoading: boolean;  
  setLoading: (val: boolean) \=\> void;  
}

export const useAuthStore \= create\<AuthState\>((set) \=\> ({  
  user: null,  
  setUser: (user) \=\> set({ user }),  
  isLoading: true,  
  setLoading: (val) \=\> set({ isLoading: val }),  
}));

## **Langkah 4: Membangun Layar Autentikasi (Login)**

Gunakan Gluestack UI untuk membuat form login yang modern.

Buat file app/login.tsx:

// app/login.tsx  
import { useState } from 'react';  
import { router } from 'expo-router';  
import \* as SecureStore from 'expo-secure-store';  
import { Box, VStack, Input, InputField, Button, ButtonText, Text, Heading } from '@gluestack-ui/themed';  
import api from '../src/utils/api';  
import { useAuthStore } from '../src/stores/authStore';

export default function LoginScreen() {  
  const \[email, setEmail\] \= useState('');  
  const \[password, setPassword\] \= useState('');  
  const { setUser } \= useAuthStore();

  const handleLogin \= async () \=\> {  
    try {  
      // Panggil API Laravel  
      const response \= await api.post('/login', { email, password });  
        
      // Simpan Token di SecureStore  
      await SecureStore.setItemAsync('userToken', response.data.token);  
        
      // Update State Global  
      setUser(response.data.user);

      // Redirect berdasarkan role  
      const role \= response.data.user.role;  
      if (role \=== 'siswa') router.replace('/(siswa)/dashboard');  
      else if (role \=== 'guru\_piket') router.replace('/(piket)/dashboard');  
      else if (role \=== 'wali\_kelas') router.replace('/(wali)/dashboard');  
      else if (role \=== 'orang\_tua') router.replace('/(ortu)/dashboard');

    } catch (error) {  
      alert('Login Gagal. Periksa kembali email dan password.');  
    }  
  };

  return (  
    \<Box flex={1} justifyContent="center" padding={20} backgroundColor="$white"\>  
      \<VStack space="xl"\>  
        \<Heading size="2xl" textAlign="center"\>SiDispen\</Heading\>  
        \<Text textAlign="center"\>Masuk ke akun Anda\</Text\>  
          
        \<Input variant="outline" size="md"\>  
          \<InputField placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" /\>  
        \</Input\>  
          
        \<Input variant="outline" size="md"\>  
          \<InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry /\>  
        \</Input\>  
          
        \<Button size="lg" onPress={handleLogin}\>  
          \<ButtonText\>Masuk\</ButtonText\>  
        \</Button\>  
      \</VStack\>  
    \</Box\>  
  );  
}

## **Langkah 5: Modul Siswa (Pengajuan & QR Code)**

### **A. Form Pengajuan Izin**

Buat app/(siswa)/pengajuan.tsx. Di sini siswa mengisi form alasan dan jenis izin, kemudian melakukan HTTP POST ke /api/dispensasi.

### **B. Menampilkan QR Code**

Buat app/(siswa)/qr/\[id\].tsx untuk menampilkan QR Code ketika tiket berstatus approved\_final.

// app/(siswa)/qr/\[id\].tsx  
import QRCode from 'react-native-qrcode-svg';  
import { Box, Text, Center } from '@gluestack-ui/themed';  
// Asumsikan qrToken didapat dari fetch detail API berdasarkan ID tiket

export default function QRCodeScreen({ qrToken }) {  
  return (  
    \<Center flex={1} bg="$white"\>  
      \<Box p={20} borderWidth={1} borderColor="$borderLight200" borderRadius="$xl"\>  
        {/\* Render QR Code Native \*/}  
        \<QRCode   
          value={qrToken}   
          size={250}   
          color="black"  
          backgroundColor="white"  
        /\>  
        \<Text mt={20} textAlign="center" fontWeight="$bold"\>  
          Tunjukkan ke Satpam  
        \</Text\>  
      \</Box\>  
    \</Center\>  
  );  
}

## **Langkah 6: Modul Guru Piket (Tombol "Ready" & Approval)**

Guru Piket memerlukan tombol sakelar (Toggle) untuk menandakan dimulainya *shift* mereka (mengirim request ke /api/piket/ready).

Buat app/(piket)/dashboard.tsx:

import { useState } from 'react';  
import { Box, Text, Button, ButtonText, HStack, VStack } from '@gluestack-ui/themed';  
import api from '../../src/utils/api';

export default function PiketDashboard() {  
  const \[isReady, setIsReady\] \= useState(false);

  const toggleReady \= async () \=\> {  
    try {  
      if (\!isReady) {  
        await api.post('/piket/ready');  
        alert('Anda sekarang dalam status READY. Tiket akan diarahkan ke Anda.');  
      } else {  
        await api.post('/piket/checkout');  
        alert('Shift selesai.');  
      }  
      setIsReady(\!isReady);  
    } catch (e) {  
      alert('Terjadi kesalahan server');  
    }  
  };

  return (  
    \<VStack p={20} space="md"\>  
      \<HStack justifyContent="space-between" alignItems="center"\>  
        \<Text size="lg" fontWeight="bold"\>Status Piket:\</Text\>  
        \<Button action={isReady ? "negative" : "positive"} onPress={toggleReady}\>  
          \<ButtonText\>{isReady ? "Akhiri Shift" : "Set Ready"}\</ButtonText\>  
        \</Button\>  
      \</HStack\>  
        
      \<Text mt={20}\>Daftar Menunggu Persetujuan:\</Text\>  
      {/\* TODO: Gunakan FlatList untuk merender data dari API GET /dispensasi/pending \*/}  
    \</VStack\>  
  );  
}

## **Langkah 7: Modul UI Chat Tiket**

Meskipun real-time-nya akan dikerjakan di Fase 5, kita perlu mendesain UI obrolannya.

Gunakan FlatList di React Native untuk menampilkan pesan, dan TextInput dengan Button *Send* di bagian bawah (mirip UI WhatsApp) yang terikat dengan ID Tiket.

## **Ceklis Penyelesaian Fase 4**

* \[ \] Autentikasi berjalan lancar (Bisa login dan mendapat Token API).  
* \[ \] Token API sukses tersimpan di *SecureStore* (User tidak perlu login ulang saat aplikasi ditutup lalu dibuka).  
* \[ \] *Role-based Navigation* aktif: Siswa masuk ke dasbor siswa, guru masuk ke dasbor guru.  
* \[ \] Tombol **"Ready"** guru piket berfungsi dan sukses memanggil API backend.  
* \[ \] Siswa dapat melakukan form *submit* pengajuan izin dan menembak *endpoint* backend.  
* \[ \] *Library QR Code* terintegrasi dan bisa merender qr\_code\_token menjadi gambar *barcode/QR* yang bisa di-*scan*.

Jika UI dan interaksi API dasar ini sudah selesai, langkah menantang selanjutnya adalah **Fase 5: Integrasi Fitur Real-Time (WebSockets) dan Notifikasi (Push Notifications)** agar guru tidak perlu terus-*refresh* layar untuk melihat tiket baru\!