<?php

namespace App\Filament\Resources\PiketSchedules\Pages;

use App\Filament\Resources\PiketSchedules\PiketScheduleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPiketSchedules extends ListRecords
{
    protected static string $resource = PiketScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
