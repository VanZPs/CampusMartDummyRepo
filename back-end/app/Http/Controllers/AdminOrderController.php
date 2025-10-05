<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Menampilkan semua pesanan untuk admin.
     */
    public function index()
    {
        $orders = Order::with(['items.product', 'user'])
                       ->latest()
                       ->get();
        return response()->json($orders);
    }


    /**
     * Mengubah status pesanan.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:diproses,dikirim,selesai,dibatalkan',
        ]);

        $order->status = $request->status;
        $order->save();

        return response()->json($order->load(['items.product', 'user']));
    }
}