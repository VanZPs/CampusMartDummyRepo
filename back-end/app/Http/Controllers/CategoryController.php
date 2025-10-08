<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function getRandomCategories()
    {
        $categories = Category::inRandomOrder()->limit(5)->get();
        return response()->json($categories);
    }

    public function showProductsByCategory(Category $category)
    {
        $products = $category->products()->where('is_active', true)->get();


        return response()->json([
            'category' => $category,
            'products' => $products  
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name|max:255',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }
}