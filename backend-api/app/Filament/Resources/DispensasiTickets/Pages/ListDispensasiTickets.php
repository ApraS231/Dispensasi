<?php

namespace App\Filament\Resources\DispensasiTickets\Pages;

use App\Filament\Resources\DispensasiTickets\DispensasiTicketResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDispensasiTickets extends ListRecords
{
    protected static string $resource = DispensasiTicketResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
