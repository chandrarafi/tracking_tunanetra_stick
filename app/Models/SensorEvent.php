<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorEvent extends Model
{
    protected $fillable = [
        'event',
        'status',
        'lat',
        'lng',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
        ];
    }
}
