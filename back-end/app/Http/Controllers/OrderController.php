<?php


namespace App\Http\Controllers;


use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;
use Illuminate\Validation\ValidationException;


class OrderController extends Controller
{
    /**
     * Membuat pesanan baru (checkout).
     */
    public function store(Request $request)
    {
        $request->validate([
            'address_text' => 'required|string|max:1000',
            'item_ids' => 'required|array|min:1',
            'item_ids.*' => 'exists:cart_items,id',
        ]);


        $user = Auth::user();
        $cart = Cart::where('user_id', $user->id)->firstOrFail();
       
        $itemsToCheckout = $cart->items()->whereIn('id', $request->item_ids)->with('product')->get();


        if ($itemsToCheckout->isEmpty()) {
            return response()->json(['message' => 'Tidak ada item yang dipilih untuk checkout.'], 400);
        }


        try {
            $order = DB::transaction(function () use ($user, $request, $itemsToCheckout, $cart) {
                $total = 0;


                foreach ($itemsToCheckout as $item) {
                    $product = $item->product;
                    if ($item->qty > $product->stock) {
                        throw new \Exception('Stok untuk produk ' . $product->name . ' tidak mencukupi.');
                    }
                    $total += $product->price * $item->qty;
                }


                $newOrder = Order::create([
                    'user_id' => $user->id,
                    'total' => $total,
                    'status' => 'diproses',
                    'address_text' => $request->address_text,
                ]);


                foreach ($itemsToCheckout as $item) {
                    $newOrder->items()->create([
                        'product_id' => $item->product_id,
                        'price' => $item->product->price,
                        'qty' => $item->qty,
                        'subtotal' => $item->product->price * $item->qty,
                    ]);
                    $item->product->decrement('stock', $item->qty);
                }


                $cart->items()->whereIn('id', $request->item_ids)->delete();


                return $newOrder;
            });


            return response()->json($order->load('items.product'), 201);


        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }


    /**
     * Menampilkan riwayat pesanan pengguna.
     */
    public function index()
    {
        $user = Auth::user();
        $orders = Order::with('items.product')
                        ->where('user_id', $user->id)
                        ->latest()
                        ->get();


        return response()->json($orders);
    }


    /**
     * CheckOut Direct
     */
    public function checkoutDirect(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'address_text' => 'required|string|max:1000',
        ]);


        $product = Product::findOrFail($validated['product_id']);
        $quantity = $validated['quantity'];
        $totalPrice = $product->price * $quantity;


        try {
            DB::beginTransaction();


            if ($product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok produk tidak mencukupi. Sisa stok: ' . $product->stock,
                ]);
            }




            $order = Order::create([
                'user_id' => $request->user()->id,
                'total' => $totalPrice, 
                'status' => 'diproses', 
                'address_text' => $validated['address_text'], 
            ]);


 
            $order->items()->create([
                'product_id' => $product->id,
                'price' => $product->price,
                'qty' => $quantity, 
                'subtotal' => $totalPrice,
            ]);


            $product->decrement('stock', $quantity);


            DB::commit();


            return response()->json($order->load('items.product'), 201);


        } catch (\Exception $e) {
            DB::rollBack();
            if ($e instanceof ValidationException) {
                return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
            }
            return response()->json(['message' => 'Terjadi kesalahan saat memproses pesanan.', 'error' => $e->getMessage()], 500);
        }
    }
}
