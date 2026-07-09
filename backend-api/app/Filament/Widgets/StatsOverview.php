<?php

namespace App\Filament\Widgets;

use App\Models\DispensasiTicket;
use App\Models\User;
use App\Models\PiketSchedule;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        // Days translation for Piket Schedule calculation
        $daysMap = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];

        // 1. Total Tiket Bulan Ini Trend
        $trendBulanIni = collect(range(6, 0))->map(fn ($days) => 
            DispensasiTicket::whereDate('created_at', today()->subDays($days))->count()
        )->all();

        // 2. Menunggu Persetujuan Trend
        $trendPending = collect(range(6, 0))->map(fn ($days) => 
            DispensasiTicket::where('status', 'pending')
                ->whereDate('created_at', today()->subDays($days))
                ->count()
        )->all();

        // 3. Siswa Terdaftar Trend
        $trendSiswa = collect(range(6, 0))->map(fn ($days) => 
            User::where('peran', 'siswa')
                ->whereDate('created_at', '<=', today()->subDays($days))
                ->count()
        )->all();

        // 4. Tiket Disetujui Hari Ini Trend
        $tiketDisetujuiHariIni = DispensasiTicket::whereDate('updated_at', today())
            ->whereIn('status', ['approved_by_piket', 'approved_final', 'completed_exit'])
            ->count();
        $trendApproved = collect(range(6, 0))->map(fn ($days) => 
            DispensasiTicket::whereIn('status', ['approved_by_piket', 'approved_final', 'completed_exit'])
                ->whereDate('updated_at', today()->subDays($days))
                ->count()
        )->all();

        // 5. Total Guru Piket Aktif Hari Ini Trend
        $currentDayIndo = $daysMap[now()->format('l')] ?? 'Senin';
        $activePiketCount = PiketSchedule::where('hari', $currentDayIndo)->count();
        $trendPiket = collect(range(6, 0))->map(function ($days) use ($daysMap) {
            $dayName = today()->subDays($days)->format('l');
            $dayIndo = $daysMap[$dayName] ?? 'Senin';
            return PiketSchedule::where('hari', $dayIndo)->count();
        })->all();

        // 6. Approval Rate Trend
        $totalProcessed = DispensasiTicket::whereNotIn('status', ['pending', 'waiting_piket'])->count();
        $totalApproved = DispensasiTicket::whereIn('status', ['approved_by_wali', 'approved_by_piket', 'approved_final', 'completed_exit'])->count();
        $approvalRate = $totalProcessed > 0 ? round(($totalApproved / $totalProcessed) * 100, 1) : 100;

        $trendApprovalRate = collect(range(6, 0))->map(function ($days) {
            $date = today()->subDays($days);
            $processed = DispensasiTicket::whereNotIn('status', ['pending', 'waiting_piket'])
                ->whereDate('updated_at', $date)
                ->count();
            $approved = DispensasiTicket::whereIn('status', ['approved_by_wali', 'approved_by_piket', 'approved_final', 'completed_exit'])
                ->whereDate('updated_at', $date)
                ->count();
            return $processed > 0 ? round(($approved / $processed) * 100) : 100;
        })->all();

        return [
            Stat::make('Total Tiket Bulan Ini', DispensasiTicket::whereMonth('created_at', now()->month)->count())
                ->description('Seluruh perizinan bulan ini')
                ->descriptionIcon('heroicon-m-document-text')
                ->chart($trendBulanIni)
                ->color('primary'),

            Stat::make('Menunggu Persetujuan', DispensasiTicket::where('status', 'pending')->count())
                ->description('Butuh tindakan segera')
                ->descriptionIcon('heroicon-m-clock')
                ->chart($trendPending)
                ->color('warning'),

            Stat::make('Siswa Terdaftar', User::where('peran', 'siswa')->count())
                ->description('Total akun siswa aktif')
                ->descriptionIcon('heroicon-m-user-group')
                ->chart($trendSiswa)
                ->color('success'),

            Stat::make('Disetujui Hari Ini', $tiketDisetujuiHariIni)
                ->description('Perizinan yang disetujui hari ini')
                ->descriptionIcon('heroicon-m-check-circle')
                ->chart($trendApproved)
                ->color('info'),

            Stat::make('Guru Piket Hari Ini', $activePiketCount)
                ->description('Staf piket terjadwal')
                ->descriptionIcon('heroicon-m-calendar')
                ->chart($trendPiket)
                ->color('gray'),

            Stat::make('Approval Rate', $approvalRate . '%')
                ->description('Rasio tiket disetujui')
                ->descriptionIcon('heroicon-m-presentation-chart-line')
                ->chart($trendApprovalRate)
                ->color('success'),
        ];
    }
}

