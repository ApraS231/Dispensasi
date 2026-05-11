<?php

namespace App\Filament\Resources\DispensasiTickets\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;

class DispensasiTicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label('Tanggal')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
                TextColumn::make('siswa.name')
                    ->label('Nama Siswa')
                    ->searchable(),
                TextColumn::make('kelas.nama_kelas')
                    ->label('Kelas'),
                TextColumn::make('jenis_izin')
                    ->label('Jenis Izin')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sakit' => 'danger',
                        'keperluan_keluarga' => 'warning',
                        'izin' => 'info',
                        'dispensasi' => 'info',
                        'keterangan_lain' => 'gray',
                        'lainnya' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved_by_wali' => 'info',
                        'approved_by_piket' => 'info',
                        'approved_final' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('guruPiket.name')
                    ->label('Guru Piket')
                    ->default('-')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('waliKelas.name')
                    ->label('Wali Kelas')
                    ->default('-')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved_by_wali' => 'Approved (Wali)',
                        'approved_by_piket' => 'Approved (Piket)',
                        'approved_final' => 'Approved Final',
                        'rejected' => 'Ditolak',
                    ]),
                SelectFilter::make('jenis_izin')
                    ->options([
                        'sakit' => 'Sakit',
                        'keperluan_keluarga' => 'Keperluan Keluarga',
                        'izin' => 'Izin',
                        'dispensasi' => 'Dispensasi',
                        'keterangan_lain' => 'Keterangan Lain',
                        'lainnya' => 'Lainnya',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
            ]);
    }
}
