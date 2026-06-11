<?php

namespace App\Filament\Widgets;

use App\Models\DispensasiTicket;
use Filament\Widgets\ChartWidget;

class MonthlyTrendWidget extends ChartWidget
{
    protected ?string $heading = 'Tren Perizinan Mingguan (4 Minggu Terakhir)';

    public function getType(): string
    {
        return 'line';
    }

    protected static ?int $sort = 1;

    protected function getData(): array
    {
        $weeks = [
            'Minggu I' => [today()->subDays(27), today()->subDays(21)],
            'Minggu II' => [today()->subDays(20), today()->subDays(14)],
            'Minggu III' => [today()->subDays(13), today()->subDays(7)],
            'Minggu IV' => [today()->subDays(6), today()],
        ];

        $sakitData = [];
        $izinData = [];
        $dispensasiData = [];

        foreach ($weeks as $label => $dates) {
            $sakitData[] = DispensasiTicket::where('jenis_izin', 'sakit')
                ->whereBetween('created_at', [$dates[0]->startOfDay(), $dates[1]->endOfDay()])
                ->count();
            $izinData[] = DispensasiTicket::where('jenis_izin', 'izin')
                ->whereBetween('created_at', [$dates[0]->startOfDay(), $dates[1]->endOfDay()])
                ->count();
            $dispensasiData[] = DispensasiTicket::where('jenis_izin', 'dispensasi')
                ->whereBetween('created_at', [$dates[0]->startOfDay(), $dates[1]->endOfDay()])
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Sakit',
                    'data' => $sakitData,
                    'borderColor' => '#EF4444',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.1)',
                    'fill' => 'origin',
                ],
                [
                    'label' => 'Izin',
                    'data' => $izinData,
                    'borderColor' => '#F59E0B',
                    'backgroundColor' => 'rgba(245, 158, 11, 0.1)',
                    'fill' => 'origin',
                ],
                [
                    'label' => 'Dispensasi',
                    'data' => $dispensasiData,
                    'borderColor' => '#3B82F6',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'fill' => 'origin',
                ],
            ],
            'labels' => array_keys($weeks),
        ];
    }
}
