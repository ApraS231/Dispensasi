<?php

namespace App\Filament\Resources\DispensasiTickets\Tables;

use Filament\Tables;
use Filament\Actions\ViewAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\BulkAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;
use App\Models\DispensasiTicket;

class DispensasiTicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label('Tanggal')
                    ->since()
                    ->tooltip(fn ($record) => $record->created_at->format('d M Y H:i'))
                    ->sortable(),
                TextColumn::make('siswa.nama')
                    ->label('Nama Siswa')
                    ->searchable()
                    ->description(fn (DispensasiTicket $record): ?string => $record->kelas->nama_kelas ?? null),
                TextColumn::make('jenis_izin')
                    ->label('Jenis Izin')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sakit' => 'danger',
                        'izin' => 'warning',
                        'dispensasi' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'sakit' => 'Sakit',
                        'izin' => 'Izin',
                        'dispensasi' => 'Dispensasi',
                        default => $state,
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
                TextColumn::make('guruPiket.nama')
                    ->label('Guru Piket')
                    ->default('-')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('waliKelas.nama')
                    ->label('Wali Kelas')
                    ->default('-')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Menunggu',
                        'waiting_piket' => 'Menunggu Piket',
                        'approved_by_wali' => 'Disetujui Wali',
                        'approved_by_piket' => 'Disetujui Piket',
                        'approved_final' => 'Disetujui Final',
                        'completed_exit' => 'Selesai Keluar',
                        'rejected' => 'Ditolak',
                    ]),
                SelectFilter::make('jenis_izin')
                    ->options([
                        'sakit' => 'Sakit',
                        'izin' => 'Izin',
                        'dispensasi' => 'Dispensasi',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    BulkAction::make('approve')
                        ->label('Setujui Terpilih')
                        ->icon('heroicon-m-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(fn (\Illuminate\Database\Eloquent\Collection $records) => $records->each->update(['status' => 'approved_final'])),
                    BulkAction::make('reject')
                        ->label('Tolak Terpilih')
                        ->icon('heroicon-m-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(fn (\Illuminate\Database\Eloquent\Collection $records) => $records->each->update(['status' => 'rejected'])),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
