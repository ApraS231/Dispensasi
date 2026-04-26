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
                Select::make('wali_kelas_id')
                    ->label('Wali Kelas')
                    ->relationship('waliKelas', 'name')
                    ->searchable()
                    ->preload()
                    ->nullable(),
            ]);
    }
}
