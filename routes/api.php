<?php

use App\Http\Controllers\SensorController;
use Illuminate\Support\Facades\Route;

Route::post('/event', [SensorController::class, 'storeEvent']);
Route::post('/emergency', [SensorController::class, 'storeEmergency']);
