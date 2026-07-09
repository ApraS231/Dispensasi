<?php

namespace App\Filament\Widgets;

use App\Models\DispensasiTicket;
use App\Filament\Resources\DispensasiTickets\DispensasiTicketResource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Filament\Tables\Columns\TextColumn;

class LatestTicketsWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    
    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = 'Tiket Dispensasi Terbaru';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                DispensasiTicket::query()->latest()->limit(5)
            )
            ->columns([
                TextColumn::make('siswa.nama')
                    ->label('Siswa')
                    ->weight('bold')
                    ->searchable(),
                TextColumn::make('kelas.nama_kelas')
                    ->label('Kelas'),
                TextColumn::make('jenis_izin')
                    ->label('Jenis Izin')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sakit' => 'danger',
                        'izin' => 'warning',
                        'dispensasi' => 'info',
                        default => 'gray',
                    }),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'waiting_piket' => 'warning',
                        'approved_by_wali' => 'info',
                        'approved_by_piket' => 'info',
                        'approved_final' => 'success',
                        'completed_exit' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Menunggu',
                        'waiting_piket' => 'Menunggu Piket',
                        'approved_by_wali' => 'Disetujui Wali',
                        'approved_by_piket' => 'Disetujui Piket',
                        'approved_final' => 'Disetujui Final',
                        'completed_exit' => 'Selesai Keluar',
                        'rejected' => 'Ditolak',
                        default => $state,
                    }),
                TextColumn::make('created_at')
                    ->label('Waktu Pengajuan')
                    ->dateTime('d M Y H:i')
                    ->description(fn (DispensasiTicket $record): string => $record->created_at->diffForHumans()),
            ])
            ->actions([
                \Filament\Actions\Action::make('view')
                    ->label('Detail')
                    ->url(fn (DispensasiTicket $record): string => DispensasiTicketResource::getUrl('view', ['record' => $record]))
                    ->icon('heroicon-m-eye'),
            ])
            ->paginated(false);
    }
}
