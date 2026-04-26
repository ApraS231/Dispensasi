<?php

namespace App\Filament\Resources\DispensasiTickets\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class DispensasiTicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('siswa_id')
                    ->required(),
                TextInput::make('kelas_id')
                    ->required(),
                TextInput::make('wali_kelas_id'),
                TextInput::make('guru_piket_id'),
                TextInput::make('piket_attendance_id'),
                TextInput::make('jenis_izin')
                    ->required()
                    ->default('sakit'),
                Textarea::make('alasan')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('lampiran_bukti'),
                DateTimePicker::make('waktu_mulai')
                    ->required(),
                DateTimePicker::make('waktu_selesai')
                    ->required(),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                Textarea::make('catatan_penolakan')
                    ->columnSpanFull(),
            ]);
    }
}
