<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Menyimpan produk baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
        ]);

        $imageName = time().'.'.$request->image->extension();

        $request->image->storeAs('public/products', $imageName);

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'image' => $imageName,
        ]);

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
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'required|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $product->fill($request->except('image'));

        if ($request->hasFile('image')) {
            $imageName = time().'.'.$request->image->extension();
            $request->image->move(public_path('images/products'), $imageName);
            $product->image = $imageName;
        }

        $product->save();

        return response()->json($product);
    }


    /**
     * Hapus produk dari katalog
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }
}