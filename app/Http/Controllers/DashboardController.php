<?php

namespace App\Http\Controllers;

use App\Models\EmergencyEvent;
use App\Models\SensorEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $sensorEvents = SensorEvent::orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $emergencyEvents = EmergencyEvent::orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $stats = [
            'total_events' => SensorEvent::count(),
            'water_events' => SensorEvent::where('event', 'water')->where('status', true)->count(),
            'fire_events' => SensorEvent::where('event', 'fire')->where('status', true)->count(),
            'emergency_events' => EmergencyEvent::count(),
        ];

        return Inertia::render('dashboard', [
            'sensorEvents' => $sensorEvents,
            'emergencyEvents' => $emergencyEvents,
            'stats' => $stats,
        ]);
    }
}
