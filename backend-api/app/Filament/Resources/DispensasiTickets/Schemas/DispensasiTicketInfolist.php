<?php

namespace App\Filament\Resources\DispensasiTickets\Schemas;

use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Schemas\Schema;

class DispensasiTicketInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)
                    ->schema([
                        // Left Column (Span 2) - ticket details and status
                        Grid::make(1)
                            ->columnSpan(2)
                            ->schema([
                                Section::make('Detail Perizinan')
                                    ->schema([
                                        TextEntry::make('jenis_izin')
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
                                        Grid::make(2)
                                            ->schema([
                                                TextEntry::make('waktu_mulai')
                                                    ->label('Mulai')
                                                    ->dateTime('d M Y H:i'),
                                                TextEntry::make('waktu_selesai')
                                                    ->label('Selesai')
                                                    ->dateTime('d M Y H:i'),
                                            ]),
                                        TextEntry::make('alasan')
                                            ->label('Alasan / Keterangan')
                                            ->columnSpanFull(),
                                    ]),

                                Section::make('Status Approval')
                                    ->schema([
                                        Grid::make(2)
                                            ->schema([
                                                TextEntry::make('status')
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
                                                TextEntry::make('guruPiket.name')
                                                    ->label('Guru Piket')
                                                    ->placeholder('-'),
                                            ]),
                                        TextEntry::make('catatan_penolakan')
                                            ->label('Catatan Penolakan')
                                            ->placeholder('-')
                                            ->columnSpanFull(),
                                    ]),
                            ]),

                        // Right Column (Span 1) - student details and metadata/evidence
                        Grid::make(1)
                            ->columnSpan(1)
                            ->schema([
                                Section::make('Informasi Siswa')
                                    ->schema([
                                        TextEntry::make('siswa.name')
                                            ->label('Nama Siswa')
                                            ->weight('bold'),
                                        TextEntry::make('kelas.nama_kelas')
                                            ->label('Kelas'),
                                        TextEntry::make('waliKelas.name')
                                            ->label('Wali Kelas')
                                            ->placeholder('-'),
                                    ]),

                                Section::make('Lampiran Bukti & Metadata')
                                    ->schema([
                                        ImageEntry::make('lampiran_bukti')
                                            ->label('Lampiran Bukti')
                                            ->placeholder('Tidak ada lampiran')
                                            ->size(200),
                                        Grid::make(2)
                                            ->schema([
                                                TextEntry::make('created_at')
                                                    ->label('Dibuat Pada')
                                                    ->dateTime('d M Y H:i'),
                                                TextEntry::make('updated_at')
                                                    ->label('Diperbarui Pada')
                                                    ->dateTime('d M Y H:i'),
                                            ]),
                                    ]),
                            ]),
                    ]),
            ]);
    }
}
