<?php

namespace App\Events;

use App\Models\EmergencyEvent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmergencyEventReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public EmergencyEvent $emergencyEvent
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('sensor-events'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'EmergencyEventReceived';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->emergencyEvent->id,
            'type' => $this->emergencyEvent->type,
            'lat' => $this->emergencyEvent->lat,
            'lng' => $this->emergencyEvent->lng,
            'created_at' => $this->emergencyEvent->created_at->toISOString(),
        ];
    }
}
