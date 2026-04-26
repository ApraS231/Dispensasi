<?php

namespace App\Filament\Resources\DispensasiTickets\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class DispensasiTicketInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('id')
                    ->label('ID'),
                TextEntry::make('siswa_id'),
                TextEntry::make('kelas_id'),
                TextEntry::make('wali_kelas_id')
                    ->placeholder('-'),
                TextEntry::make('guru_piket_id')
                    ->placeholder('-'),
                TextEntry::make('piket_attendance_id')
                    ->placeholder('-'),
                TextEntry::make('jenis_izin'),
                TextEntry::make('alasan')
                    ->columnSpanFull(),
                TextEntry::make('lampiran_bukti')
                    ->placeholder('-'),
                TextEntry::make('waktu_mulai')
                    ->dateTime(),
                TextEntry::make('waktu_selesai')
                    ->dateTime(),
                TextEntry::make('status'),
                TextEntry::make('catatan_penolakan')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
