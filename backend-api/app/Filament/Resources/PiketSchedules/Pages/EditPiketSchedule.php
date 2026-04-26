<?php

namespace App\Filament\Resources\PiketSchedules\Pages;

use App\Filament\Resources\PiketSchedules\PiketScheduleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPiketSchedule extends EditRecord
{
    protected static string $resource = PiketScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
