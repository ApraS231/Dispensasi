<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SISPENSI - Sistem Informasi Perizinan Siswa SMA Negeri 3</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #F0F4F8;
            overflow-x: hidden;
        }
        .liquid-bg {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            background: linear-gradient(135deg, #F0F4F8 0%, #DDEBFA 100%);
        }
        .blob {
            position: absolute;
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, rgba(123, 189, 232, 0.45) 0%, rgba(73, 118, 159, 0.45) 100%);
            border-radius: 50%;
            filter: blur(100px);
            animation: move 25s infinite alternate ease-in-out;
        }
        @keyframes move {
            0% { transform: translate(-10%, -10%) scale(1); }
            50% { transform: translate(15%, 10%) scale(1.1); }
            100% { transform: translate(5%, 20%) scale(1); }
        }
        .glass-header {
            background: rgba(255, 255, 255, 0.35);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.6);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.75);
            box-shadow: 0 20px 40px -10px rgba(0, 29, 57, 0.08);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 30px 60px -15px rgba(0, 29, 57, 0.15);
            background: rgba(255, 255, 255, 0.6);
            border-color: rgba(255, 255, 255, 0.9);
        }
        .btn-primary {
            background: linear-gradient(135deg, #0A4174 0%, #49769F 100%);
            box-shadow: 0 8px 20px rgba(10, 65, 116, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(10, 65, 116, 0.35);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(10, 65, 116, 0.2);
            color: #0A4174;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-secondary:hover {
            background: #ffffff;
            border-color: #0A4174;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(10, 65, 116, 0.1);
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.5);
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            background: rgba(255, 255, 255, 0.7);
            border-color: rgba(10, 65, 116, 0.1);
        }
        .animate-fade-in-up {
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-down {
            opacity: 0;
            animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(25px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
            0% { opacity: 0; transform: translateY(-25px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .feature-card svg {
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .feature-card:hover svg {
            transform: rotate(15deg) scale(1.15);
        }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased">
    <!-- Liquid Background Elements -->
    <div class="liquid-bg">
        <div class="blob top-[-15%] left-[-15%]"></div>
        <div class="blob bottom-[-15%] right-[-15%]" style="animation-delay: -10s; background: linear-gradient(135deg, rgba(78, 142, 162, 0.3) 0%, rgba(123, 189, 232, 0.3) 100%);"></div>
    </div>

    <!-- Header Navigation -->
    <header class="glass-header w-full py-4 px-6 md:px-12 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3 animate-fade-in-down">
                <img src="{{ asset('images/logo.png') }}" alt="SISPENSI Logo" class="w-10 h-10 object-contain transition-transform duration-300 hover:scale-110">
                <div>
                    <h1 class="text-xl font-extrabold text-[#0A4174] tracking-tight leading-none">SISPENSI</h1>
                    <span class="text-[10px] font-bold text-[#49769F] uppercase tracking-wider">SMA Negeri 3</span>
                </div>
            </div>
            
            <nav class="flex items-center gap-4">
                <a href="{{ route('register.ortu') }}" class="text-sm font-semibold text-[#0A4174] hover:text-[#49769F] transition-colors">Daftar Wali Murid</a>
                <a href="/admin/login" class="px-5 py-2.5 rounded-xl text-sm font-bold btn-primary text-white">Dashboard Admin</a>
            </div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow flex items-center py-12 px-6 md:px-12">
        <div class="max-w-7xl mx-auto w-full">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <!-- Welcome Copy / Title Info -->
                <div class="lg:col-span-5 space-y-6 text-left animate-fade-in-up">
                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#0A4174]/10 text-[#0A4174] uppercase tracking-wider">
                        Sistem Layanan Sekolah
                    </span>
                    <h2 class="text-4xl md:text-5xl font-extrabold text-[#001D39] leading-tight tracking-tight">
                        Efisiensi Perizinan Siswa Secara Mandiri
                    </h2>
                    <p class="text-base text-[#49769F] font-medium leading-relaxed">
                        Selamat datang di <strong>SISPENSI</strong> (Sistem Perizinan Siswa), sistem informasi perizinan online SMA Negeri 3. Aplikasi ini dirancang untuk mempermudah orang tua dalam memantau dan mengajukan perizinan serta izin siswa, serta membantu guru piket dan manajemen sekolah melakukan pencatatan secara transparan dan akurat.
                    </p>
                    <div class="pt-4 flex flex-wrap gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <span class="text-sm font-semibold text-[#001D39]">Proses Terintegrasi</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <span class="text-sm font-semibold text-[#001D39]">Monitoring Real-Time</span>
                        </div>
                    </div>
                </div>

                <!-- Portal Access Cards -->
                <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style="animation-delay: 0.2s;">
                    
                    <!-- Parent / Ortu Portal Card -->
                    <div class="glass-card rounded-[32px] p-8 flex flex-col justify-between min-h-[340px]">
                        <div class="space-y-6">
                            <div class="w-14 h-14 bg-[#0A4174]/10 rounded-2xl flex items-center justify-center text-[#0A4174]">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-[#0A4174]">Portal Orang Tua</h3>
                                <p class="text-sm text-[#49769F] mt-2 font-medium leading-relaxed">
                                    Akses khusus bagi orang tua / wali murid untuk membuat pengajuan perizinan siswa dan melihat riwayat kehadiran anak secara berkala.
                                </p>
                            </div>
                        </div>
                        <div class="mt-8 pt-4 border-t border-gray-200/50 flex flex-col gap-3">
                            <a href="{{ route('register.ortu') }}" class="w-full text-center py-3.5 rounded-xl text-sm font-bold btn-primary text-white block">
                                Daftar Akun Wali
                            </a>
                            <p class="text-center text-xs text-gray-400 font-medium">Pendaftaran wali murid baru</p>
                        </div>
                    </div>

                    <!-- School Admin Portal Card -->
                    <div class="glass-card rounded-[32px] p-8 flex flex-col justify-between min-h-[340px]">
                        <div class="space-y-6">
                            <div class="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V9a5 5 0 00-9.754-1.578M18 10v-.058A8.001 8.001 0 0013 2.062V12a5 5 0 00.57 2.871l.054.09L18 10z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-[#0A4174]">Portal Staf & Admin</h3>
                                <p class="text-sm text-[#49769F] mt-2 font-medium leading-relaxed">
                                    Halaman masuk bagi Guru Piket, Walikelas, dan Administrator Sekolah untuk verifikasi pengajuan serta monitoring perizinan harian.
                                </p>
                            </div>
                        </div>
                        <div class="mt-8 pt-4 border-t border-gray-200/50 flex flex-col gap-3">
                            <a href="/admin/login" class="w-full text-center py-3.5 rounded-xl text-sm font-bold btn-secondary block">
                                Masuk Dashboard
                            </a>
                            <p class="text-center text-xs text-gray-400 font-medium">Khusus guru dan staf sekolah</p>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Features Grid Section -->
            <div class="mt-24 pt-12 border-t border-gray-200/60">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="feature-card rounded-2xl p-6">
                        <div class="w-10 h-10 bg-[#0A4174]/5 rounded-xl flex items-center justify-center text-[#0A4174] mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h4 class="font-bold text-[#001D39] text-base">Pengajuan Cepat</h4>
                        <p class="text-xs text-[#49769F] mt-2 leading-relaxed font-medium">Proses pendaftaran surat perizinan secara online memudahkan penanganan izin tanpa kertas fisik.</p>
                    </div>

                    <div class="feature-card rounded-2xl p-6">
                        <div class="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                            </svg>
                        </div>
                        <h4 class="font-bold text-[#001D39] text-base">Persetujuan Terpadu</h4>
                        <p class="text-xs text-[#49769F] mt-2 leading-relaxed font-medium">Validasi langsung oleh guru piket dan wali kelas untuk menjaga kepatuhan dan ketertiban akademis.</p>
                    </div>

                    <div class="feature-card rounded-2xl p-6">
                        <div class="w-10 h-10 bg-amber-500/5 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                        </div>
                        <h4 class="font-bold text-[#001D39] text-base">Transparansi Kehadiran</h4>
                        <p class="text-xs text-[#49769F] mt-2 leading-relaxed font-medium">Memastikan setiap perizinan terhubung langsung dengan catatan absensi harian kelas.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="w-full py-8 text-center text-xs text-[#49769F] border-t border-gray-200/50 bg-white/20">
        <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; {{ date('Y') }} SMA Negeri 3. Hak Cipta Dilindungi.</p>
            <p class="font-semibold uppercase tracking-widest text-[10px] text-[#0A4174]">SISPENSI Sistem Perizinan</p>
        </div>
    </footer>
</body>
</html>
