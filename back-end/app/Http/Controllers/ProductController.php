<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    /**
     * Menyimpan produk baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'required|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $path = public_path('images/products');
            $image->move($path, $imageName);
            $validated['image'] = $imageName;
        }

        $product = Product::create($validated);
        return response()->json($product, 201);
    }


    /**
     * Memberikan 5 rekomendasi produk acak saat search bar diklik.
     */
    public function recommendations()
    {
        $products = Product::where('is_active', true)->inRandomOrder()->limit(5)->get();
        return response()->json($products);
    }


    /**
     * Fitur live search, memberikan 5 produk sesuai input.
     */
    public function searchSuggestions(Request $request)
    {
        $query = $request->input('q');

        if (empty($query)) {
            return $this->recommendations();
        }

        $products = Product::where('is_active', true)
                            ->where('name', 'LIKE', "%{$query}%")
                            ->orWhereHas('category', function ($q) use ($query) {
                                $q->where('name', 'LIKE', "%{$query}%");
                            })
                            ->limit(5)
                            ->get();

        return response()->json($products);
    }


    /**
     * Pencarian penuh saat pengguna menekan Enter.
     */
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (empty($query)) {
            return response()->json([]);
        }

        $products = Product::where('is_active', true)
                           ->where('name', 'LIKE', "%{$query}%")
                           ->orWhereHas('category', function ($q) use ($query) {
                               $q->where('name', 'LIKE', "%{$query}%");
                           })
                           ->get();

        return response()->json($products);
    }


    /**
     * Update produk spesifik dari db
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'required|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                $oldImagePath = public_path('images/products/' . $product->image);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }
            }

            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $path = public_path('images/products');
            $image->move($path, $imageName);
            $validated['image'] = $imageName;
        }

        $product->update($validated);
        return response()->json($product);
    }

    /**
     * Hapus produk dari katalog
     */
    public function destroy(Product $product)
    {
        $categoryId = $product->category_id;

        $product->cartItems()->delete();

        if ($product->image) {
            $imagePath = public_path('images/products/' . $product->image);
            if (File::exists($imagePath)) {
                File::delete($imagePath);
            }
        }

        $product->delete();

        $remainingProducts = Product::where('category_id', $categoryId)->count();
        if ($remainingProducts === 0) {
            $category = Category::find($categoryId);
            if ($category) {
                $category->delete();
            }
        }

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }


    /**
     * Detail produk
     */
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }
}