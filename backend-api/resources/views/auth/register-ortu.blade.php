<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Orang Tua - SISPENSI</title>
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
        .animate-fade-in-up {
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="liquid-bg">
        <div class="blob top-[-10%] left-[-10%]"></div>
        <div class="blob bottom-[-10%] right-[-10%]" style="animation-delay: -10s; background: linear-gradient(135deg, rgba(78, 142, 162, 0.3) 0%, rgba(123, 189, 232, 0.3) 100%);"></div>
    </div>

    <div class="w-full max-w-lg animate-fade-in-up">
        <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[24px] shadow-xl mb-6 glass-card overflow-hidden">
                <img src="{{ asset('images/logo.png') }}" alt="SISPENSI Logo" class="w-14 h-14 object-contain">
            </div>
            <h1 class="text-4xl font-extrabold text-[#0A4174] tracking-tight">SISPENSI</h1>
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
                        <input type="password" name="password" id="password-input" required 
                            class="w-full px-6 py-4 rounded-2xl focus:outline-none input-skeu text-[#001D39] font-medium placeholder:text-gray-400"
                            placeholder="••••••••">
                        <div class="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden mt-1 ml-1">
                            <div id="strength-bar" class="h-full w-0 transition-all duration-300"></div>
                        </div>
                        <p id="strength-text" class="text-[10px] font-bold text-gray-400 mt-1 ml-1"></p>
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
                    <button type="submit" id="submit-btn"
                        class="w-full btn-liquid text-white font-bold py-5 rounded-2xl text-lg shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3">
                        <svg id="spinner" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span id="submit-text">Daftar Akun</span>
                    </button>
                </div>
            </form>

            <div class="mt-10 pt-8 border-t border-white/40 text-center">
                <p class="text-xs text-[#49769F] font-semibold uppercase tracking-widest">SISPENSI Mobile Application</p>
                <p class="text-sm text-gray-500 mt-2">Daftar sekarang untuk mulai memantau kehadiran anak Anda.</p>
            </div>
        </div>
    </div>
    
    <script>
        const passwordInput = document.getElementById('password-input');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            let strength = 0;
            if (val.length >= 6) strength += 25;
            if (val.match(/[A-Z]/)) strength += 25;
            if (val.match(/[0-9]/)) strength += 25;
            if (val.match(/[^A-Za-z0-9]/)) strength += 25;
            
            strengthBar.className = 'h-full transition-all duration-300';
            if (strength === 0) {
                strengthBar.style.width = '0%';
                strengthText.innerText = '';
            } else if (strength <= 25) {
                strengthBar.style.width = '25%';
                strengthBar.classList.add('bg-red-500');
                strengthText.innerText = 'Sangat Lemah';
                strengthText.className = 'text-[10px] font-bold text-red-500 mt-1 ml-1';
            } else if (strength <= 50) {
                strengthBar.style.width = '50%';
                strengthBar.classList.add('bg-orange-500');
                strengthText.innerText = 'Lemah';
                strengthText.className = 'text-[10px] font-bold text-orange-500 mt-1 ml-1';
            } else if (strength <= 75) {
                strengthBar.style.width = '75%';
                strengthBar.classList.add('bg-yellow-500');
                strengthText.innerText = 'Sedang';
                strengthText.className = 'text-[10px] font-bold text-yellow-500 mt-1 ml-1';
            } else {
                strengthBar.style.width = '100%';
                strengthBar.classList.add('bg-emerald-500');
                strengthText.innerText = 'Kuat';
                strengthText.className = 'text-[10px] font-bold text-emerald-500 mt-1 ml-1';
            }
        });

        const form = document.querySelector('form');
        const submitBtn = document.getElementById('submit-btn');
        const submitText = document.getElementById('submit-text');
        const spinner = document.getElementById('spinner');

        form.addEventListener('submit', () => {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            submitText.innerText = 'Memproses...';
            spinner.classList.remove('hidden');
        });
    </script>
</body>
</html>
