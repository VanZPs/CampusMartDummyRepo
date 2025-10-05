<?php




use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminOrderController;
use App\Models\Product;

// Rute Otentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rute yang memerlukan otentikasi
Route::middleware('auth:web')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // RUTE KERANJANG (CART)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/items/{item}', [CartController::class, 'update']);
    Route::delete('/cart/items/{item}', [CartController::class, 'destroy']);

    // RUTE PESANAN (ORDER)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/checkout', [OrderController::class, 'store']);
});


// Rute Produk
Route::get('/products', function () {
    $products = Product::where('is_active', true)->get();
    return response()->json($products);
});
Route::post('/products', [ProductController::class, 'store']);


// RUTE PENCARIAN PRODUK
// 1. Rekomendasi 5 produk acak saat search bar diklik
Route::get('/products/recommendations', [ProductController::class, 'recommendations']);

// 2. Saran pencarian (live search) saat pengguna mengetik
Route::get('/products/search-suggestions', [ProductController::class, 'searchSuggestions']);

// 3. Pencarian penuh saat pengguna menekan Enter
Route::get('/products/search', [ProductController::class, 'search']);


//  RUTE KATEGORI
// 1. Mengambil 5 kategori acak untuk homepage
Route::get('/categories/random', [CategoryController::class, 'getRandomCategories']);

// 2. Menampilkan produk berdasarkan ID kategori
Route::get('/categories/{category}/products', [CategoryController::class, 'showProductsByCategory']);


// RUTE KHUSUS ADMIN
Route::middleware(['auth:web', 'admin'])->group(function () {
    // Product Management
    Route::post('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Order Management
    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::patch('/admin/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
});