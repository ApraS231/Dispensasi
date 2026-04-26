<?php
use Illuminate\Support\Facades\Http;
use App\Models\DispensasiTicket;
use App\Models\PiketAttendanceLog;
use App\Models\User;

$baseUrl = 'http://127.0.0.1:8000/api';

function login($email, $password) {
    $apiUrl = 'http://127.0.0.1:8000/api';
    $response = Http::post("$apiUrl/login", [
        'email' => $email,
        'password' => $password
    ]);
    return $response->json()['token'] ?? null;
}

echo "Starting Blackbox Testing (Corrected Flow)...\n";

// 1. Guru Piket Set Ready DULU agar auto-assignment bekerja
$piketToken = login('piket@test.com', 'password');
$response = Http::withToken($piketToken)->post("$baseUrl/piket/ready");
if ($response->status() !== 200) {
    echo "[FAILED] Piket Ready: " . $response->body() . "\n";
    exit(1);
}
echo "[OK] Guru Piket Set Ready\n";

// 2. Login Siswa
$siswaToken = login('siswa@test.com', 'password');
if (!$siswaToken) {
    echo "[FAILED] Siswa Login\n";
    exit(1);
}
echo "[OK] Siswa Login\n";

// 3. Submit Ticket
$response = Http::withToken($siswaToken)->post("$baseUrl/dispensasi", [
    'jenis_izin' => 'sakit',
    'alasan' => 'Demam tinggi',
    'waktu_mulai' => now()->toDateTimeString(),
    'waktu_selesai' => now()->addHours(4)->toDateTimeString(),
]);

if ($response->status() !== 201) {
    echo "[FAILED] Submit Ticket: " . $response->body() . "\n";
    exit(1);
}
$ticketId = $response->json()['data']['id'];
echo "[OK] Ticket Submitted (ID: $ticketId)\n";

// 4. Verify Assignment
$ticket = DispensasiTicket::find($ticketId);
if (!$ticket->wali_kelas_id || !$ticket->guru_piket_id) {
    echo "[FAILED] Auto-assignment failed (Wali: " . ($ticket->wali_kelas_id ?? 'null') . ", Piket: " . ($ticket->guru_piket_id ?? 'null') . ")\n";
    exit(1);
}
echo "[OK] Auto-assigned to Wali Kelas & Guru Piket\n";

// 5. Wali Kelas Approve
$waliToken = login('wali@test.com', 'password');
$response = Http::withToken($waliToken)->post("$baseUrl/dispensasi/$ticketId/approve");
if ($response->status() !== 200) {
    echo "[FAILED] Wali Approve: " . $response->body() . "\n";
    exit(1);
}
echo "[OK] Wali Kelas Approved\n";

// 6. Guru Piket Approve Final
$response = Http::withToken($piketToken)->post("$baseUrl/dispensasi/$ticketId/approve");
if ($response->status() !== 200) {
    echo "[FAILED] Piket Final Approve: " . $response->body() . "\n";
    exit(1);
}
echo "[OK] Guru Piket Approved Final\n";

// 7. Final Verification
$ticket->refresh();
if ($ticket->status !== 'approved_final' || !$ticket->qr_code_token) {
    echo "[FAILED] Final Status Invalid: " . $ticket->status . "\n";
    exit(1);
}
echo "[SUCCESS] Blackbox Testing Passed!\n";
