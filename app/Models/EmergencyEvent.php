<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyEvent extends Model
{
    protected $fillable = [
        'type',
        'lat',
        'lng',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
        ];
    }
}
