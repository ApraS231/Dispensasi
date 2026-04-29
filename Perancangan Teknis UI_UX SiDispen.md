# **🛠️ Perancangan Teknis & Sistematis Peningkatan UI/UX SiDispen**

Dokumen ini memuat spesifikasi teknis dan rekomendasi arsitektur *frontend* untuk meningkatkan interaktivitas dan performa visual aplikasi SiDispen. Pendekatan ini dirancang untuk ekosistem **React Native, Expo, dan NativeWind**.

## **1\. Arsitektur Animasi & Mikro-Interaksi**

Untuk mencapai performa 60fps (atau 120fps di perangkat modern) tanpa membebani JS Thread, semua animasi kompleks harus dijalankan di UI Thread.

### **A. Gestur Geser (Swipe Actions) untuk Antrean Validasi**

* **Target UX**: Wali Kelas/Guru Piket dapat menyetujui atau menolak tiket tanpa membuka detail.  
* **Stack Teknis**: react-native-gesture-handler & react-native-reanimated (v3).  
* **Implementasi Sistematis**:  
  1. Bungkus komponen TicketCard dengan PanGestureHandler.  
  2. Gunakan useSharedValue untuk melacak translateX.  
  3. Terapkan useAnimatedStyle untuk menggeser kartu.  
  4. **Interpolasi Visual**: Saat translateX \> 0 (geser kanan), munculkan *layer* latar belakang hijau dengan ikon centang (lucide-react-native). Saat translateX \< 0 (geser kiri), munculkan warna merah dengan ikon silang.  
  5. Gunakan runOnJS untuk men-trigger fungsi API (Supabase) setelah *threshold* geseran terpenuhi.

### **B. Shared Element Transition (Transisi Berkelanjutan)**

* **Target UX**: Transisi mulus dari daftar riwayat (kartu kecil) ke halaman detail tiket (layar penuh) agar pengguna tidak kehilangan konteks spasial.  
* **Stack Teknis**: expo-router & react-native-reanimated (Shared Element API).  
* **Implementasi Sistematis**:  
  1. Bungkus elemen gambar lampiran dan judul pada komponen daftar dengan \<Animated.View sharedTransitionTag="ticket-image-123" /\>.  
  2. Pada halaman detail, gunakan tag yang sama persis: sharedTransitionTag="ticket-image-123".  
  3. Terapkan customTransition untuk mengatur durasi *spring* agar terasa natural (tidak kaku/linear).

### **C. Komponen Interaktif (Bouncy Button)**

* **Target UX**: Tombol terasa reaktif terhadap sentuhan (meniru fisika pegas).  
* **Stack Teknis**: Library moti (berbasis reanimated) atau *custom hooks* Reanimated.  
* **Implementasi Sistematis**:  
  * Buat komponen AnimatedPressable. Saat onPressIn, skala (*scale*) elemen diubah menjadi 0.95. Saat onPressOut, kembalikan ke 1 dengan konfigurasi *spring* (stiffness tinggi, damping rendah).

## **2\. Umpan Balik Sensorik (Sensory Feedback)**

Sentuhan fisik meningkatkan validasi aksi pengguna secara signifikan.

### **A. Pemetaan Haptic Feedback**

* **Stack Teknis**: expo-haptics.  
* **Implementasi Sistematis (Haptic Matrix)**:  
  * **Success Haptic** (NotificationFeedbackType.Success): Di-trigger saat API merespons status 200 OK (Izin disetujui, QR divalidasi).  
  * **Error Haptic** (NotificationFeedbackType.Error): Di-trigger saat validasi QR gagal atau koneksi terputus.  
  * **Light/Impact Haptic** (ImpactFeedbackStyle.Light): Di-trigger saat pengguna berinteraksi dengan elemen UI seperti *toggle switch*, membuka *dropdown* jenis izin, atau mencapai batas tarik Pull-to-Refresh.

## **3\. Optimasi Rendering Layout (Performance UX)**

Layout yang tersendat (*janky*) akan merusak estetika desain M3.

### **A. Penggantian FlatList ke FlashList**

* **Target UX**: *Scrolling* super mulus pada halaman Riwayat yang memiliki ratusan data izin.  
* **Stack Teknis**: @shopify/flash-list.  
* **Implementasi Sistematis**:  
  1. Refaktor FlatList menjadi FlashList.  
  2. Wajib tetapkan prop estimatedItemSize={120} (estimasi tinggi TicketCard dalam pixel) agar FlashList dapat mengalokasikan memori secara presisi.  
  3. Pastikan komponen dalam render item tidak memiliki state anonim untuk mencegah *re-render* yang tidak perlu.

### **B. Skeleton Loading States**

* **Target UX**: Menghindari *Layout Shift* (tata letak melompat) saat data sedang di-fetch.  
* **Stack Teknis**: moti/skeleton atau NativeWind utility dengan animasi pulse.  
* **Implementasi Sistematis**:  
  1. Buat komponen TicketCardSkeleton.  
  2. Saat state isLoading pada *hooks* (misal: TanStack Query / SWR) bernilai true, render array kosong berisi 5 komponen skeleton.  
  3. Berikan animasi gradien bergeser (*shimmer*) dari kiri ke kanan berulang.

### **C. Image Caching & Rendering**

* **Target UX**: Gambar lampiran bukti izin / foto profil dimuat secara instan tanpa berkedip.  
* **Stack Teknis**: expo-image (pengganti komponen \<Image\> bawaan React Native).  
* **Implementasi Sistematis**:  
  * Gunakan komponen \<Image\> dari expo-image. Aktifkan properti cachePolicy="disk" dan sediakan placeholder (seperti *blurhash*) saat gambar dari *bucket* Supabase sedang diunduh.

## **4\. Sistem Tema & State (Theming & State UX)**

### **A. Implementasi Dark Mode via NativeWind**

* **Target UX**: Adaptasi warna dinamis tanpa delay (flicker-free).  
* **Stack Teknis**: NativeWind (Tailwind) & Zustand.  
* **Implementasi Sistematis**:  
  1. Simpan preferensi tema di Zustand berpadu dengan AsyncStorage (persist).  
  2. Konfigurasi tailwind.config.js untuk menggunakan darkMode: 'class'.  
  3. Di level root komponen (\_layout.tsx), injeksi *class* dark ke elemen terluar berdasarkan state Zustand atau preferensi sistem (useColorScheme).  
  4. Penulisan kelas: bg-surfaceContainer dark:bg-surfaceContainer-dark.

### **B. Optimistic UI Updates**

* **Target UX**: Aplikasi terasa secepat kilat tanpa jeda *loading* saat menyetujui izin.  
* **Stack Teknis**: Zustand atau React Query.  
* **Implementasi Sistematis**:  
  1. Saat Guru menekan "Terima", **jangan** tunggu respons API.  
  2. Langsung mutasi *state* lokal di Zustand agar tiket menghilang dari layar atau berubah menjadi hijau.  
  3. Lakukan *fetch* ke Supabase di *background*. Jika *request* gagal (misal: jaringan putus), kembalikan (*rollback*) state lokal ke semula dan munculkan Toast *Error* beserta *Haptic Error*.

## **5\. Sistem Elevasi & Soft Shadow (Cross-Platform)**

Desain Material 3 sangat bergantung pada elevasi untuk menunjukkan hierarki. Implementasi *shadow* di React Native membutuhkan penanganan khusus agar konsisten antara iOS dan Android.

### **A. Standardisasi Soft Shadow via NativeWind**

* **Target UX**: Kartu (SoftCard) dan kontainer memiliki bayangan yang halus dan membaur (*diffused*), menghindari bayangan hitam pekat yang terlihat kaku dan murah.  
* **Stack Teknis**: tailwind.config.js (Custom Box Shadows) & React Native Platform API.  
* **Implementasi Sistematis**:  
  1. Jangan gunakan bayangan bawaan yang terlalu gelap. Konfigurasikan *custom shadow* di tailwind.config.js yang secara otomatis memetakan shadowOpacity, shadowRadius, dan shadowOffset untuk iOS, serta elevation untuk Android.  
  2. Gunakan opasitas sangat rendah (rgba(0,0,0, 0.04)) dengan radius/blur yang besar (misal: 12px) untuk memberikan kesan melayang secara elegan pada komponen TicketCard.

### **B. Colored Shadows (Efek Glow pada Tombol)**

* **Target UX**: Tombol aksi utama (seperti *Floating Action Button* atau tombol "Ajukan Izin") memancarkan warna bayangan yang senada dengan warna tombolnya, memberikan efek *glow* yang premium dan modern.  
* **Implementasi Sistematis**:  
  1. Untuk tombol dengan warna *Primary* (\#2E7D32), gunakan shadowColor: '\#2E7D32' alih-alih warna hitam.  
  2. **Konfigurasi Spesifik Platform**:  
     * **iOS**: Set shadowOpacity: 0.35, shadowRadius: 8, dan shadowOffset: { width: 0, height: 4 }.  
     * **Android**: Pastikan target SDK mendukung berwarna (Android 9/API 28+). Gunakan kombinasi elevation: 6 dan shadowColor.

### **C. Interactive & Dynamic Shadows**

* **Target UX**: Elemen merespons secara fisik terhadap sentuhan (ilusi 3D), memperkuat kepuasan interaksi (*tactile feel*).  
* **Stack Teknis**: react-native-reanimated (dikombinasikan dengan Bouncy Button).  
* **Implementasi Sistematis**:  
  1. Sinkronkan nilai bayangan dengan status sentuhan pengguna menggunakan useAnimatedStyle.  
  2. **Interaksi Tekan (onPressIn)**: Kurangi nilai elevation (Android) atau turunkan shadowOffset & shadowOpacity (iOS) secara bersamaan saat skala komponen mengecil (scale: 0.95). Ini menciptakan ilusi tombol sedang "ditekan masuk" ke dalam layar.  
  3. **Interaksi Lepas (onPressOut)**: Kembalikan bayangan ke nilai semula (mengembang/memantul ke luar) beriringan dengan rilis animasi pegas (*spring*).

*Dokumen dirancang untuk sinkronisasi antara UI/UX Designer dan Frontend Engineer (React Native).*