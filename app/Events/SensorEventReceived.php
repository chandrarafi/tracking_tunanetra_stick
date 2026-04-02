<?php

namespace App\Events;

use App\Models\SensorEvent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorEventReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SensorEvent $sensorEvent
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('sensor-events'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'SensorEventReceived';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->sensorEvent->id,
            'event' => $this->sensorEvent->event,
            'status' => $this->sensorEvent->status,
            'lat' => $this->sensorEvent->lat,
            'lng' => $this->sensorEvent->lng,
            'created_at' => $this->sensorEvent->created_at->toISOString(),
        ];
    }
}
