<?php

namespace App\Filament\Resources\DispensasiTickets\Pages;

use App\Filament\Resources\DispensasiTickets\DispensasiTicketResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewDispensasiTicket extends ViewRecord
{
    protected static string $resource = DispensasiTicketResource::class;

    public function getTitle(): string
    {
        $siswaName = $this->record->siswa?->name ?? '';
        return $siswaName ? "Detail Tiket Dispensasi - {$siswaName}" : "Detail Tiket Dispensasi";
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
