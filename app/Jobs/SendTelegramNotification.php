<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendTelegramNotification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $message,
        public ?string $chatId = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = $this->chatId ?? env('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) {
            return;
        }

        // Get the token, gracefully handling if user accidentally included the "bot" prefix
        $token = str_replace('bot', '', $botToken);

        // Disable SSL verification to prevent cURL error 60 on local Windows environments
        $response = \Illuminate\Support\Facades\Http::withoutVerifying()->post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $this->message,
            'parse_mode' => 'HTML',
        ]);

        if ($response->failed()) {
            throw new \Exception('Telegram Error: ' . $response->body());
        }
    }
}
