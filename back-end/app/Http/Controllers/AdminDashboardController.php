<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Mengambil data statistik dan log aktivitas untuk dashboard admin.
     */
    public function index(Request $request)
    {
        // --- Bagian Statistik ---
        $productStats = Product::query()
            ->select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active'),
                DB::raw('SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive')
            )
            ->first();

        $orderStats = Order::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // --- Bagian Log Aktivitas (Pesanan Terbaru) ---

        $recentOrders = Order::with(['user', 'items.product'])
                            ->latest() 
                            ->paginate(10); 

        return response()->json([
            'statistics' => [
                'products' => [
                    'total' => $productStats->total ?? 0,
                    'active' => $productStats->active ?? 0,
                    'inactive' => $productStats->inactive ?? 0,
                ],
                'orders' => [
                    'total' => $orderStats->sum(),
                    'processed' => $orderStats->get('diproses', 0),
                    'shipped' => $orderStats->get('dikirim', 0),
                    'completed' => $orderStats->get('selesai', 0),
                    'cancelled' => $orderStats->get('dibatalkan', 0),
                ],
            ],
            'activity_log' => $recentOrders
        ]);
    }
}