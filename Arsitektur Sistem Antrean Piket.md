# **Arsitektur & Implementasi: Database-Backed Pool Queue (Sistem Antrean Piket)**

Dokumen ini memuat spesifikasi teknis untuk mengelola transisi tiket dispensasi antara Wali Kelas dan Guru Piket menggunakan pendekatan **Status-Based Pool**. Dengan sistem ini, tiket tidak dikunci ke satu individu Guru Piket sejak awal, melainkan diletakkan di sebuah "antrean pusat" (Pool) dan baru akan diklaim (*claimed*) pada detik eksekusi.

## **1\. Modifikasi Skema Database (Supabase)**

Pastikan kolom guru\_piket\_id pada tabel dispensasi\_tickets diizinkan bernilai NULL (Nullable). Ini sangat penting karena saat tiket baru disetujui Wali Kelas, tiket tersebut belum memiliki "pemilik" (Guru Piket yang mengeksekusi).

\-- Memastikan kolom guru\_piket\_id bisa bernilai NULL  
ALTER TABLE dispensasi\_tickets ALTER COLUMN guru\_piket\_id DROP NOT NULL;

## **2\. Implementasi Backend (Laravel 11\)**

Kita akan memperbarui tiga alur utama di Laravel: memasukkan tiket ke kolam (*Pool*), menarik daftar antrean (*Fetch Queue*), dan mengunci tiket (*Claim & Approve*).

### **A. Memasukkan Tiket ke Antrean (Trigger Wali Kelas)**

Saat Wali Kelas menekan "Approve", tiket dilempar ke status waiting\_piket.

// app/Http/Controllers/Api/DispensasiController.php

public function approveWaliKelas(Request $request, $id) {  
    $tiket \= DispensasiTicket::findOrFail($id);  
      
    // Validasi otorisasi Wali Kelas...  
    if ($tiket-\>wali\_kelas\_id \!== $request-\>user()-\>id) {  
         return response()-\>json(\['message' \=\> 'Unauthorized'\], 403);  
    }

    // 1\. Lempar tiket ke "Meja Piket" (Pool)  
    $tiket-\>update(\[  
        'status' \=\> 'waiting\_piket',  
        'guru\_piket\_id' \=\> null // Biarkan kosong/mengambang  
    \]);

    // 2\. Cari Guru Piket yang sedang aktif DETIK INI untuk dikirimi Push Notif  
    $now \= now();  
    $activePiket \= \\App\\Models\\PiketSchedule::where('hari\_dalam\_minggu', $now-\>dayOfWeekIso)  
        \-\>where('jam\_mulai', '\<=', $now-\>format('H:i:s'))  
        \-\>where('jam\_selesai', '\>=', $now-\>format('H:i:s'))  
        \-\>with('guru') // Asumsi ada relasi ke tabel User  
        \-\>first();

    if ($activePiket && $activePiket-\>guru-\>device\_token) {  
        \\App\\Services\\ExpoPushService::send(  
            $activePiket-\>guru-\>device\_token,  
            '⏳ Antrean Baru di Meja Piket',  
            "Tiket izin {$tiket-\>siswa-\>name} telah disetujui Wali Kelas dan menunggu validasi Anda.",  
            \['url' \=\> "/piket/tiket/{$tiket-\>id}"\]  
        );  
    }

    return response()-\>json(\['message' \=\> 'Disetujui. Tiket diteruskan ke Antrean Piket.'\]);  
}

### **B. Menarik Antrean (Dashboard Guru Piket)**

API ini dipanggil secara berkala oleh aplikasi mobile Guru Piket (menggunakan React Query / SWR / WebSocket) untuk melihat isi "Meja Piket".

// app/Http/Controllers/Api/PiketController.php

public function getQueue(Request $request) {  
    $now \= now();  
    $guruId \= $request-\>user()-\>id;

    // 1\. Cek apakah Guru ini sedang masuk jadwal Shift  
    $isScheduledNow \= \\App\\Models\\PiketSchedule::where('guru\_id', $guruId)  
        \-\>where('hari\_dalam\_minggu', $now-\>dayOfWeekIso)  
        \-\>where('jam\_mulai', '\<=', $now-\>format('H:i:s'))  
        \-\>where('jam\_selesai', '\>=', $now-\>format('H:i:s'))  
        \-\>exists();

    // Jika di luar jadwal, kembalikan status false agar UI menyesuaikan  
    if (\!$isScheduledNow) {  
        return response()-\>json(\[  
            'is\_active\_shift' \=\> false,  
            'data' \=\> \[\],  
            'message' \=\> 'Saat ini Anda sedang tidak dalam jadwal piket.'  
        \]);  
    }

    // 2\. Tarik semua tiket dari Pool (FIFO \- First In First Out)  
    $queue \= \\App\\Models\\DispensasiTicket::with(\['siswa', 'kelas'\])  
        \-\>where('status', 'waiting\_piket')  
        \-\>orderBy('updated\_at', 'asc') // Yang paling lama menunggu ada di atas  
        \-\>get();

    return response()-\>json(\[  
        'is\_active\_shift' \=\> true,  
        'data' \=\> $queue  
    \]);  
}

### **C. Mengunci & Mengeksekusi Tiket (Claim & Approve)**

Mencegah terjadinya *Race Condition* (Dua Guru Piket menyetujui tiket yang sama secara bersamaan).

// app/Http/Controllers/Api/PiketController.php

public function approveTicket(Request $request, $id) {  
    // Gunakan lockForUpdate jika menggunakan database transaction untuk sistem skala besar  
    // Atau gunakan pengecekan sederhana:  
    $tiket \= DispensasiTicket::where('id', $id)  
                \-\>where('status', 'waiting\_piket') // Pastikan masih di pool  
                \-\>whereNull('guru\_piket\_id')       // Pastikan belum diklaim orang lain  
                \-\>first();

    if (\!$tiket) {  
        return response()-\>json(\[  
            'message' \=\> 'Tiket ini sudah diproses oleh Guru Piket lain atau tidak valid.'  
        \], 409); // 409 Conflict  
    }

    // Eksekusi (Claim tiket atas nama guru ini)  
    $tiket-\>update(\[  
        'status' \=\> 'approved\_final',  
        'guru\_piket\_id' \=\> $request-\>user()-\>id, // KUNCI KE GURU INI  
        'qr\_token' \=\> \\Illuminate\\Support\\Str::uuid(),  
        'expires\_at' \=\> now()-\>addHours(12)  
    \]);

    // Kirim notifikasi ke Siswa...  
      
    return response()-\>json(\['message' \=\> 'Tiket berhasil disetujui dan diklaim oleh Anda.'\]);  
}

## **3\. Implementasi Frontend (Expo React Native)**

Pada antarmuka Guru Piket, kita menerapkan "Skeuo-Glass" (kaca buram tebal) dan menampilkan dua *State* UI yang sangat berbeda berdasarkan respons is\_active\_shift dari API.

// app/(piket)/dashboard.tsx  
import React, { useEffect, useState } from 'react';  
import { View, Text, FlatList, RefreshControl } from 'react-native';  
import api from '../../src/utils/api';  
import { TicketCard } from '../../src/components/TicketCard'; // Komponen Skeuo-Glass  
import { Lock } from 'lucide-react-native';

export default function PiketQueueScreen() {  
  const \[queue, setQueue\] \= useState(\[\]);  
  const \[isActiveShift, setIsActiveShift\] \= useState(false);  
  const \[isLoading, setIsLoading\] \= useState(true);

  const fetchQueue \= async () \=\> {  
    setIsLoading(true);  
    try {  
      const res \= await api.get('/piket/queue');  
      setIsActiveShift(res.data.is\_active\_shift);  
      setQueue(res.data.data);  
    } catch (e) {  
      console.error("Gagal menarik antrean:", e);  
    } finally {  
      setIsLoading(false);  
    }  
  };

  useEffect(() \=\> {  
    fetchQueue();  
    // Opsional: Implementasikan Polling ringan setiap 30 detik  
    // const interval \= setInterval(fetchQueue, 30000);  
    // return () \=\> clearInterval(interval);  
  }, \[\]);

  // UI STATE 1: Di luar jam kerja (Terkunci)  
  if (\!isActiveShift && \!isLoading) {  
    return (  
      \<View className="flex-1 items-center justify-center bg-gray-50 p-6"\>  
        \<View className="bg-white/60 p-8 rounded-3xl border border-white/40 items-center"   
              style={{ elevation: 5, shadowColor: '\#000', shadowOpacity: 0.1, shadowRadius: 10 }}\>  
          \<Lock size={64} color="\#9CA3AF" /\>  
          \<Text className="text-xl font-bold font-jakarta mt-4 text-center text-gray-800"\>  
            Di Luar Jadwal Shift  
          \</Text\>  
          \<Text className="text-gray-500 font-jakarta text-center mt-2"\>  
            Antrean tiket akan otomatis terbuka di layar ini ketika jadwal shift Anda dimulai.  
          \</Text\>  
        \</View\>  
      \</View\>  
    );  
  }

  // UI STATE 2: Sedang Bertugas (Active Queue)  
  return (  
    \<View className="flex-1 bg-gray-50"\>  
      \<View className="px-6 pt-6 pb-2"\>  
        \<Text className="text-2xl font-bold font-jakarta text-gray-800"\>Meja Piket\</Text\>  
        \<Text className="text-sm font-jakarta text-gray-500"\>  
          Ada {queue.length} tiket menunggu validasi Anda  
        \</Text\>  
      \</View\>

      \<FlatList  
        data={queue}  
        keyExtractor={(item) \=\> item.id}  
        refreshControl={\<RefreshControl refreshing={isLoading} onRefresh={fetchQueue} /\>}  
        contentContainerStyle={{ padding: 24, gap: 16 }}  
        renderItem={({ item }) \=\> (  
          \<TicketCard   
            ticket={item}   
            onApproveSuccess={fetchQueue} // Refresh daftar jika sukses menyetujui  
          /\>  
        )}  
        ListEmptyComponent={  
          \!isLoading && (  
            \<Text className="text-center mt-10 text-gray-400 font-jakarta"\>  
              Hore\! Tidak ada antrean tiket saat ini.  
            \</Text\>  
          )  
        }  
      /\>  
    \</View\>  
  );  
}

## **4\. Keuntungan Sistem "Pool Queue" Ini:**

1. **Anti-Nyangkut (No Stale Data):** Jika Guru A (Shift 1\) izin pulang cepat atau HP-nya rusak, tiket anak-anak tidak akan tertahan. Begitu Guru B (Shift 2\) jadwalnya masuk, semua tiket yang belum diproses otomatis muncul di layar Guru B.  
2. **Skalabilitas Concurrency:** Jika pada suatu hari sekolah menugaskan 2 Guru Piket di jam yang sama, keduanya akan melihat daftar antrean yang sama. Siapa yang menekan *Approve* lebih dulu, dialah yang dicatat di guru\_piket\_id (berkat validasi HTTP 409 Conflict di backend). Guru satunya akan mendapat pesan bahwa tiket sudah diproses temannya.  
3. **Otomatisasi Penuh:** Menghapus tugas admin/operator untuk melakukan *"assign tiket manual"* atau mereset status guru yang lupa menekan tombol "Selesai Piket". Semua murni dihitung dari detik (*timestamp*) mesin.