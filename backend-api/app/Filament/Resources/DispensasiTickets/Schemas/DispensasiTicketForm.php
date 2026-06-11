<?php

namespace App\Filament\Resources\DispensasiTickets\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Filament\Schemas\Schema;

class DispensasiTicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        Section::make('Data Siswa & Kelas')
                            ->columnSpan(1)
                            ->schema([
                                Select::make('siswa_id')
                                    ->label('Siswa')
                                    ->relationship('siswa', 'name')
                                    ->searchable()
                                    ->required()
                                    ->helperText('Pilih siswa yang mengajukan perizinan'),
                                Select::make('kelas_id')
                                    ->label('Kelas')
                                    ->relationship('kelas', 'nama_kelas')
                                    ->searchable()
                                    ->required(),
                                Select::make('wali_kelas_id')
                                    ->label('Wali Kelas')
                                    ->relationship('waliKelas', 'name')
                                    ->searchable()
                                    ->placeholder('Pilih Wali Kelas'),
                            ]),

                        Section::make('Detail Perizinan')
                            ->columnSpan(1)
                            ->schema([
                                Select::make('jenis_izin')
                                    ->label('Jenis Izin')
                                    ->options([
                                        'sakit' => 'Sakit',
                                        'izin' => 'Izin',
                                        'dispensasi' => 'Dispensasi',
                                    ])
                                    ->required()
                                    ->default('sakit'),
                                DateTimePicker::make('waktu_mulai')
                                    ->label('Waktu Mulai')
                                    ->required(),
                                DateTimePicker::make('waktu_selesai')
                                    ->label('Waktu Selesai')
                                    ->required(),
                                Textarea::make('alasan')
                                    ->label('Alasan / Keterangan')
                                    ->required()
                                    ->rows(3)
                                    ->columnSpanFull(),
                            ]),

                        Section::make('Persetujuan & Catatan')
                            ->columnSpan(2)
                            ->schema([
                                Grid::make(3)
                                    ->schema([
                                        Select::make('status')
                                            ->label('Status')
                                            ->options([
                                                'pending' => 'Menunggu',
                                                'waiting_piket' => 'Menunggu Piket',
                                                'approved_by_wali' => 'Disetujui Wali',
                                                'approved_by_piket' => 'Disetujui Piket',
                                                'approved_final' => 'Disetujui Final',
                                                'completed_exit' => 'Selesai Keluar',
                                                'rejected' => 'Ditolak',
                                            ])
                                            ->required()
                                            ->default('pending'),
                                        Select::make('guru_piket_id')
                                            ->label('Guru Piket')
                                            ->relationship('guruPiket', 'name')
                                            ->searchable()
                                            ->placeholder('Pilih Guru Piket'),
                                        TextInput::make('lampiran_bukti')
                                            ->label('File Bukti')
                                            ->disabled()
                                            ->helperText('Hanya dapat diunggah dari portal siswa/ortu'),
                                    ]),
                                Textarea::make('catatan_penolakan')
                                    ->label('Catatan Penolakan')
                                    ->helperText('Wajib diisi jika status perizinan ditolak')
                                    ->rows(2)
                                    ->columnSpanFull(),
                            ]),
                    ]),
            ]);
    }
}
