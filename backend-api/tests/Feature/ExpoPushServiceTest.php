<?php

namespace Tests\Feature;

use App\Services\ExpoPushService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpoPushServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_successful()
    {
        Http::fake([
            'https://exp.host/--/api/v2/push/send' => Http::response(['data' => ['status' => 'ok']], 200),
        ]);

        $result = ExpoPushService::send('ExponentPushToken[xxxxx]', 'Test Title', 'Test Body');

        $this->assertEquals(['data' => ['status' => 'ok']], $result);

        Http::assertSent(function ($request) {
            $data = $request->data();
            return $request->url() == 'https://exp.host/--/api/v2/push/send' &&
                   count($data) === 1 &&
                   $data[0]['to'] == 'ExponentPushToken[xxxxx]' &&
                   $data[0]['title'] == 'Test Title' &&
                   $data[0]['body'] == 'Test Body';
        });
    }

    public function test_send_exception_path()
    {
        Http::fake(function ($request) {
            throw new \Exception('Network Error');
        });

        Log::shouldReceive('error')
            ->once()
            ->with('Gagal kirim Expo Push: Network Error');

        $result = ExpoPushService::send('ExponentPushToken[xxxxx]', 'Test Title', 'Test Body');

        $this->assertFalse($result);
    }
}
