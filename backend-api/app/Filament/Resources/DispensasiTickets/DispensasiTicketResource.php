<?php

namespace App\Filament\Resources\DispensasiTickets;

use App\Filament\Resources\DispensasiTickets\Pages\ListDispensasiTickets;
use App\Filament\Resources\DispensasiTickets\Pages\ViewDispensasiTicket;
use App\Filament\Resources\DispensasiTickets\Schemas\DispensasiTicketForm;
use App\Filament\Resources\DispensasiTickets\Schemas\DispensasiTicketInfolist;
use App\Filament\Resources\DispensasiTickets\Tables\DispensasiTicketsTable;
use App\Models\DispensasiTicket;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DispensasiTicketResource extends Resource
{
    protected static ?string $model = DispensasiTicket::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static ?string $recordTitleAttribute = 'status';

    protected static ?string $navigationLabel = 'Monitoring Dispensasi';

    protected static ?string $modelLabel = 'Tiket Dispensasi';

    protected static ?string $pluralModelLabel = 'Tiket Dispensasi';

    public static function form(Schema $schema): Schema
    {
        return DispensasiTicketForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return DispensasiTicketInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DispensasiTicketsTable::configure($table);
    }

    public static function canCreate(): bool
    {
        return false;
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
            'index' => ListDispensasiTickets::route('/'),
            'view' => ViewDispensasiTicket::route('/{record}'),
        ];
    }
}
