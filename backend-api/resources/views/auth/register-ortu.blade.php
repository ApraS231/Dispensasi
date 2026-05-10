<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Orang Tua - SiDispen</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
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
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, rgba(123, 189, 232, 0.4) 0%, rgba(73, 118, 159, 0.4) 100%);
            border-radius: 50%;
            filter: blur(80px);
            animation: move 20s infinite alternate;
        }
        @keyframes move {
            from { transform: translate(-10%, -10%) scale(1); }
            to { transform: translate(20%, 20%) scale(1.2); }
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 25px 50px -12px rgba(0, 29, 57, 0.1);
        }
        .input-skeu {
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: inset 0 2px 4px rgba(0, 29, 57, 0.05);
            transition: all 0.3s ease;
        }
        .input-skeu:focus {
            background: rgba(255, 255, 255, 0.9);
            border-color: #0A4174;
            box-shadow: 0 0 0 4px rgba(10, 65, 116, 0.1);
        }
        .btn-liquid {
            background: linear-gradient(135deg, #0A4174 0%, #49769F 100%);
            box-shadow: 0 10px 20px rgba(10, 65, 116, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-liquid:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(10, 65, 116, 0.3);
        }
        .btn-liquid:active {
            transform: translateY(0);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="liquid-bg">
        <div class="blob top-[-10%] left-[-10%]"></div>
        <div class="blob bottom-[-10%] right-[-10%]" style="animation-delay: -10s; background: linear-gradient(135deg, rgba(78, 142, 162, 0.3) 0%, rgba(123, 189, 232, 0.3) 100%);"></div>
    </div>

    <div class="w-full max-w-lg">
        <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[24px] shadow-xl mb-6 glass-card">
                <svg class="w-10 h-10 text-[#0A4174]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            </div>
            <h1 class="text-4xl font-extrabold text-[#0A4174] tracking-tight">SiDispen</h1>
            <p class="text-[#49769F] font-medium mt-2">Pendaftaran Orang Tua Siswa</p>
        </div>

        <div class="glass-card rounded-[40px] p-10 overflow-hidden relative">
            <form action="{{ route('register.ortu.store') }}" method="POST" class="space-y-7">
                @csrf
                
                <div class="space-y-2">
                    <label class="text-sm font-bold text-[#0A4174] ml-1">Nama Lengkap</label>
                    <input type="text" name="name" value="{{ old('name') }}" required 
                        class="w-full px-6 py-4 rounded-2xl focus:outline-none input-skeu text-[#001D39] font-medium placeholder:text-gray-400"
                        placeholder="Masukkan nama lengkap Anda">
                    @error('name') <p class="text-red-500 text-xs font-bold mt-1 ml-1">{{ $message }}</p> @enderror
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-bold text-[#0A4174] ml-1">Alamat Email</label>
                    <input type="email" name="email" value="{{ old('email') }}" required 
                        class="w-full px-6 py-4 rounded-2xl focus:outline-none input-skeu text-[#001D39] font-medium placeholder:text-gray-400"
                        placeholder="contoh@email.com">
                    @error('email') <p class="text-red-500 text-xs font-bold mt-1 ml-1">{{ $message }}</p> @enderror
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-[#0A4174] ml-1">Kata Sandi</label>
                        <input type="password" name="password" required 
                            class="w-full px-6 py-4 rounded-2xl focus:outline-none input-skeu text-[#001D39] font-medium placeholder:text-gray-400"
                            placeholder="••••••••">
                        @error('password') <p class="text-red-500 text-xs font-bold mt-1 ml-1">{{ $message }}</p> @enderror
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-bold text-[#0A4174] ml-1">Konfirmasi</label>
                        <input type="password" name="password_confirmation" required 
                            class="w-full px-6 py-4 rounded-2xl focus:outline-none input-skeu text-[#001D39] font-medium placeholder:text-gray-400"
                            placeholder="••••••••">
                    </div>
                </div>

                <div class="pt-4">
                    <button type="submit" 
                        class="w-full btn-liquid text-white font-bold py-5 rounded-2xl text-lg shadow-xl hover:opacity-90 transition-all">
                        Daftar Akun
                    </button>
                </div>
            </form>

            <div class="mt-10 pt-8 border-t border-white/40 text-center">
                <p class="text-xs text-[#49769F] font-semibold uppercase tracking-widest">SiDispen Mobile Application</p>
                <p class="text-sm text-gray-500 mt-2">Daftar sekarang untuk mulai memantau kehadiran anak Anda.</p>
            </div>
        </div>
    </div>
</body>
</html>
