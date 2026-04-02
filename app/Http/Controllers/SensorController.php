<?php

namespace App\Http\Controllers;

use App\Events\EmergencyEventReceived;
use App\Events\SensorEventReceived;
use App\Models\EmergencyEvent;
use App\Models\SensorEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SensorController extends Controller
{
    public function storeEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => 'required|string|in:water,fire',
            'status' => 'required|boolean',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
        ]);

        $sensorEvent = SensorEvent::create($validated);

        broadcast(new SensorEventReceived($sensorEvent));

        if ($validated['status']) { // Send telegram only if sensor goes active
            $emoji = $validated['event'] === 'water' ? '💧' : '🔥';
            $typeText = $validated['event'] === 'water' ? 'Air' : 'Api';
            $mapsUrl = (!empty($validated['lat']) && !empty($validated['lng'])) 
                ? "https://www.google.com/maps/search/?api=1&query={$validated['lat']},{$validated['lng']}" 
                : "Lokasi tidak diketahui (GPS mati)";
            
            $appUrl = config('app.url');
            $dashboardLink = "{$appUrl}/dashboard";
                
            $message = "<b>⚠️ PERINGATAN!</b>\n\n{$emoji} Sensor {$typeText} terdeteksi aktif!\n📍 Lokasi: <a href='{$mapsUrl}'>Lihat Peta</a>\n\nBuka Dasbor: <a href='{$dashboardLink}'>Sistem Tracking Tunanetra</a>";
            
            // Loop and dispatch to all registered admins
            $admins = \App\Models\User::whereNotNull('telegram_chat_id')->get();
            foreach ($admins as $admin) {
                if (trim($admin->telegram_chat_id) !== '') {
                    \App\Jobs\SendTelegramNotification::dispatch($message, $admin->telegram_chat_id);
                }
            }
            
            // Fallback to global config if no users have set their telegram chat ID
            if ($admins->isEmpty() && env('TELEGRAM_CHAT_ID')) {
                \App\Jobs\SendTelegramNotification::dispatch($message);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Event recorded successfully',
            'data' => $sensorEvent,
        ], 201);
    }

    public function storeEmergency(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:emergency',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
        ]);

        $emergencyEvent = EmergencyEvent::create($validated);

        broadcast(new EmergencyEventReceived($emergencyEvent));

        $mapsUrl = (!empty($validated['lat']) && !empty($validated['lng'])) 
            ? "https://www.google.com/maps/search/?api=1&query={$validated['lat']},{$validated['lng']}" 
            : "Lokasi tidak diketahui (GPS mati)";
            
        $appUrl = config('app.url');
        $dashboardLink = "{$appUrl}/dashboard";

        $message = "<b>🚨 DARURAT (EMERGENCY)!</b>\n\nTombol darurat telah ditekan!\n📍 Lokasi: <a href='{$mapsUrl}'>Lihat Peta</a>\n\nBuka Dasbor: <a href='{$dashboardLink}'>Sistem Tracking Tunanetra</a>";
        
        // Loop and dispatch to all registered admins
        $admins = \App\Models\User::whereNotNull('telegram_chat_id')->get();
        foreach ($admins as $admin) {
            if (trim($admin->telegram_chat_id) !== '') {
                \App\Jobs\SendTelegramNotification::dispatch($message, $admin->telegram_chat_id);
            }
        }
        
        // Fallback to global config if no users have set their telegram chat ID
        if ($admins->isEmpty() && env('TELEGRAM_CHAT_ID')) {
            \App\Jobs\SendTelegramNotification::dispatch($message);
        }

        return response()->json([
            'success' => true,
            'message' => 'Emergency recorded successfully',
            'data' => $emergencyEvent,
        ], 201);
    }
}
