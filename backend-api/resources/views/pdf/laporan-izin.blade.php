<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Bulanan Izin Siswa</title>
    <style>
        @page {
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin-bottom: 5px;
        }
        .header-table td {
            border: none;
            padding: 0;
        }
        .header-logo-left {
            width: 70px;
            text-align: left;
            vertical-align: middle;
        }
        .header-logo-right {
            width: 70px;
            text-align: right;
            vertical-align: middle;
        }
        .header-text {
            text-align: center;
            vertical-align: middle;
            padding: 0 10px;
        }
        .header-text h3 {
            margin: 0;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header-text h2 {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header-text h1 {
            margin: 0;
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header-text p {
            margin: 4px 0 0 0;
            font-size: 8pt;
            line-height: 1.2;
        }
        .header-line {
            border-top: 1px solid #000;
            border-bottom: 2.5px solid #000;
            height: 1.5px;
            margin: 8px 0 20px 0;
        }
        .title {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            text-transform: uppercase;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .info-table {
            width: 100%;
            margin-bottom: 15px;
            font-size: 11pt;
        }
        .info-table td {
            border: none;
            padding: 2px 0;
        }
        .info-label {
            width: 120px;
        }
        .info-colon {
            width: 15px;
            text-align: center;
        }
        .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 10pt;
        }
        .report-table th, .report-table td {
            border: 1px solid #000;
            padding: 6px 4px;
        }
        .report-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }
        .text-center {
            text-align: center;
        }
        .text-left {
            text-align: left;
        }
        .text-right {
            text-align: right;
        }
        .signature-section {
            width: 100%;
            margin-top: 25px;
            font-size: 11pt;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }
        .signature-table td {
            border: none;
            width: 50%;
            vertical-align: top;
        }
        .signature-space {
            height: 75px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="header-logo-left">
                @if($logoKaltim)
                    <img src="data:image/jpeg;base64,{{ $logoKaltim }}" width="70" alt="Logo Kaltim">
                @endif
            </td>
            <td class="header-text">
                <h3>Pemerintah Provinsi Kalimantan Timur</h3>
                <h2>Dinas Pendidikan dan Kebudayaan</h2>
                <h1>SMAN 3 Bontang</h1>
                <p>Jalan Arif Rahman Hakim km. 3 Rt.40 No.64, Belimbing Kec. Bontang Barat, Kota Bontang</p>
                <p style="margin-top: 1px;">Telepon: (0548) 303085 Web: www.sman3bontang.sch.id ; Email: smantigabontang@yahoo.co.id</p>
            </td>
            <td class="header-logo-right">
                @if($logoSma3)
                    <img src="data:image/png;base64,{{ $logoSma3 }}" width="70" alt="Logo SMA3">
                @endif
            </td>
        </tr>
    </table>
    
    <div class="header-line"></div>

    <div class="title">
        LAPORAN REKAPITULASI BULANAN IZIN DAN DISPENSASI SISWA
    </div>

    <table class="info-table">
        <tr>
            <td class="info-label">Kelas</td>
            <td class="info-colon">:</td>
            <td><strong>{{ $kelas }}</strong></td>
        </tr>
        <tr>
            <td class="info-label">Bulan / Tahun</td>
            <td class="info-colon">:</td>
            <td>{{ $bulan_nama }} / {{ $tahun }}</td>
        </tr>
        <tr>
            <td class="info-label">Hari Efektif KBM</td>
            <td class="info-colon">:</td>
            <td>{{ $hari_efektif }} Hari</td>
        </tr>
    </table>

    <table class="report-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 5%;">No</th>
                <th rowspan="2" style="width: 35%;">Nama Siswa</th>
                <th rowspan="2" style="width: 15%;">NIS</th>
                <th colspan="3">Jenis Izin (Kali)</th>
                <th rowspan="2" style="width: 10%;">Total Izin</th>
                <th rowspan="2" style="width: 10%;">% Kehadiran</th>
            </tr>
            <tr>
                <th style="width: 8%;">Sakit</th>
                <th style="width: 8%;">Izin</th>
                <th style="width: 9%;">Disp.</th>
            </tr>
        </thead>
        <tbody>
            @forelse($siswa as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-left">{{ $item['name'] }}</td>
                <td class="text-center">{{ $item['nis'] ?? '-' }}</td>
                <td class="text-center">{{ $item['sakit'] }}</td>
                <td class="text-center">{{ $item['izin'] }}</td>
                <td class="text-center">{{ $item['dispensasi'] }}</td>
                <td class="text-center">{{ $item['total_izin'] }}</td>
                <td class="text-center">{{ $item['persen_hadir'] }}%</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center" style="font-style: italic;">Tidak ada data siswa di kelas ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="signature-section">
        <table class="signature-table">
            <tr>
                <td></td>
                <td class="text-center" style="width: 45%;">
                    Bontang, {{ $tanggal_sekarang }}<br>
                    Wali Kelas {{ $kelas }},
                    <div class="signature-space"></div>
                    <strong><u>{{ $wali_kelas_nama }}</u></strong><br>
                    NIP. -
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
