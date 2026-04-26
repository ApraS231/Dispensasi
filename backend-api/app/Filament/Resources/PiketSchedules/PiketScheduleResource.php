<?php

namespace App\Filament\Resources\PiketSchedules;

use App\Filament\Resources\PiketSchedules\Pages\CreatePiketSchedule;
use App\Filament\Resources\PiketSchedules\Pages\EditPiketSchedule;
use App\Filament\Resources\PiketSchedules\Pages\ListPiketSchedules;
use App\Filament\Resources\PiketSchedules\Schemas\PiketScheduleForm;
use App\Filament\Resources\PiketSchedules\Tables\PiketSchedulesTable;
use App\Models\PiketSchedule;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PiketScheduleResource extends Resource
{
    protected static ?string $model = PiketSchedule::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'hari';

    public static function form(Schema $schema): Schema
    {
        return PiketScheduleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PiketSchedulesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPiketSchedules::route('/'),
            'create' => CreatePiketSchedule::route('/create'),
            'edit' => EditPiketSchedule::route('/{record}/edit'),
        ];
    }
}
