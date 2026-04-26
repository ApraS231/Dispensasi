<?php

namespace App\Filament\Widgets;

use App\Models\DispensasiTicket;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Tiket Bulan Ini', DispensasiTicket::whereMonth('created_at', now()->month)->count())
                ->description('Seluruh perizinan')
                ->descriptionIcon('heroicon-m-document-text')
                ->color('primary'),

            Stat::make('Menunggu Persetujuan', DispensasiTicket::where('status', 'pending')->count())
                ->description('Butuh tindakan guru')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),

            Stat::make('Siswa Terdaftar', User::where('role', 'siswa')->count())
                ->description('Total akun siswa')
                ->color('success'),
        ];
    }
}
