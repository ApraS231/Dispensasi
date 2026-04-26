<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\PiketSchedule;
use Illuminate\Http\Request;

class PiketScheduleController extends Controller
{
    public function index()
    {
        return response()->json(PiketSchedule::with('guru')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guru_id' => 'required|exists:users,id',
            'hari' => 'required|string',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);
        $schedule = PiketSchedule::create($validated);
        return response()->json($schedule, 201);
    }

    public function show($id)
    {
        return response()->json(PiketSchedule::with('guru')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $schedule = PiketSchedule::findOrFail($id);
        $validated = $request->validate([
            'guru_id' => 'sometimes|exists:users,id',
            'hari' => 'sometimes|string',
            'jam_mulai' => 'sometimes',
            'jam_selesai' => 'sometimes',
        ]);
        $schedule->update($validated);
        return response()->json($schedule);
    }

    public function destroy($id)
    {
        PiketSchedule::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}
