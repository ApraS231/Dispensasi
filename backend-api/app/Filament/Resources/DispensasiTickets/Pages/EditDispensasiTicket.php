<?php

namespace App\Filament\Resources\DispensasiTickets\Pages;

use App\Filament\Resources\DispensasiTickets\DispensasiTicketResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditDispensasiTicket extends EditRecord
{
    protected static string $resource = DispensasiTicketResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
