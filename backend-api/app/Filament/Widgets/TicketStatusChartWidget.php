<?php

namespace App\Filament\Widgets;

use App\Models\DispensasiTicket;
use Filament\Widgets\ChartWidget;

class TicketStatusChartWidget extends ChartWidget
{
    protected ?string $heading = 'Distribusi Status Tiket';

    public function getType(): string
    {
        return 'doughnut';
    }

    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $pending = DispensasiTicket::whereIn('status', ['pending', 'waiting_piket'])->count();
        $approvedWali = DispensasiTicket::where('status', 'approved_by_wali')->count();
        $approvedPiket = DispensasiTicket::where('status', 'approved_by_piket')->count();
        $approvedFinal = DispensasiTicket::whereIn('status', ['approved_final', 'completed_exit'])->count();
        $rejected = DispensasiTicket::where('status', 'rejected')->count();

        return [
            'datasets' => [
                [
                    'label' => 'Jumlah Tiket',
                    'data' => [$pending, $approvedWali, $approvedPiket, $approvedFinal, $rejected],
                    'backgroundColor' => [
                        '#F59E0B', // warning
                        '#3B82F6', // info (wali)
                        '#06B6D4', // cyan (piket)
                        '#10B981', // success
                        '#EF4444', // danger
                    ],
                ],
            ],
            'labels' => ['Menunggu', 'Disetujui Wali', 'Disetujui Piket', 'Disetujui Final', 'Ditolak'],
        ];
    }
}
