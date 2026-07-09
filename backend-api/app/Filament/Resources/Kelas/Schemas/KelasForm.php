<?php

namespace App\Filament\Resources\Kelas\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class KelasForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('nama_kelas')
                    ->label('Nama Kelas')
                    ->placeholder('Contoh: X IPA 1')
                    ->required(),
                Select::make('tingkat')
                    ->label('Tingkat')
                    ->options([
                        'X' => 'X (Sepuluh)',
                        'XI' => 'XI (Sebelas)',
                        'XII' => 'XII (Dua Belas)',
                    ])
                    ->required(),
                Select::make('id_wali_kelas')
                    ->label('Wali Kelas')
                    ->relationship('waliKelas', 'nama', fn ($query) => $query->where('peran', 'wali_kelas'))
                    ->searchable()
                    ->preload()
                    ->nullable(),
            ]);
    }
}
