<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran Berhasil - SISPENSI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #F0F4F8;
            overflow: hidden;
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
        .success-icon-bg {
            background: linear-gradient(135deg, #06D6A0 0%, #05B386 100%);
            box-shadow: 0 10px 20px rgba(6, 214, 160, 0.2);
        }
        .checkmark__circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            stroke: #ffffff;
            fill: none;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark__check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            stroke-width: 4;
            stroke-linecap: round;
            stroke: #ffffff;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }
        @keyframes stroke {
            100% { stroke-dashoffset: 0; }
        }
        .confetti-container {
            perspective: 1000px;
        }
        .confetti-piece {
            position: absolute;
            width: 10px;
            height: 10px;
            opacity: 0;
            top: -10px;
            border-radius: 50%;
            animation: fall 4s ease-out infinite;
        }
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(110vh) rotate(360deg);
                opacity: 0;
            }
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
<body class="min-h-screen flex items-center justify-center p-6 text-center">
    <div class="liquid-bg">
        <div class="blob top-[-10%] left-[-10%]"></div>
        <div class="blob bottom-[-10%] right-[-10%]" style="animation-delay: -10s; background: linear-gradient(135deg, rgba(6, 214, 160, 0.2) 0%, rgba(123, 189, 232, 0.2) 100%);"></div>
    </div>

    <div class="w-full max-w-lg animate-fade-in-up">
        <div class="glass-card rounded-[48px] p-12 relative overflow-hidden">
            <!-- Confetti particles -->
            <div class="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
                @for ($i = 0; $i < 20; $i++)
                    <div class="confetti-piece" style="left: {{ rand(5, 95) }}%; animation-delay: {{ rand(0, 20) / 10 }}s; background-color: {{ ['#0A4174', '#7BBDE8', '#06D6A0', '#FFD166', '#EF476F'][rand(0, 4)] }}"></div>
                @endfor
            </div>

            <!-- Success Animation/Icon -->
            <div class="w-28 h-28 success-icon-bg rounded-[32px] flex items-center justify-center mx-auto mb-8 transform rotate-12">
                <svg class="w-12 h-12 text-white transform -rotate-12" viewBox="0 0 52 52">
                    <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>

            <h1 class="text-4xl font-extrabold text-[#0A4174] mb-6 tracking-tight">Akun Siap!</h1>
            
            <p class="text-[#49769F] text-lg font-medium leading-relaxed mb-10">
                Pendaftaran berhasil. Sekarang Anda bisa kembali ke aplikasi mobile <span class="text-[#0A4174] font-bold">SISPENSI</span> untuk masuk ke dashboard Orang Tua.
            </p>

            <div class="space-y-6">
                <div class="p-6 bg-white/40 rounded-3xl border border-white/60">
                    <div class="flex items-center gap-4 text-left">
                        <div class="w-10 h-10 bg-[#0A4174]/10 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-[#0A4174]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-[#0A4174]">Instruksi Login</p>
                            <p class="text-xs text-[#49769F]">Gunakan email & password yang baru dibuat di aplikasi mobile.</p>
                        </div>
                    </div>
                </div>

                <p class="text-sm text-gray-400 font-medium italic">
                    Halaman ini dapat ditutup sekarang.
                </p>
            </div>
        </div>

        <p class="mt-10 text-[#0A4174] font-black text-2xl tracking-[4px] uppercase opacity-50">SISPENSI</p>
    </div>
</body>
</html>
