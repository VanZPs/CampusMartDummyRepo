<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class OrderItem extends Model
{
    use HasFactory;




    /**
     * Memberitahu Laravel untuk tidak mengelola kolom created_at dan updated_at.
     */
    public $timestamps = false;


    protected $fillable = ['order_id', 'product_id', 'price', 'qty', 'subtotal'];


    public function order()
    {
        return $this->belongsTo(Order::class);
    }


    /**
     * Mendefinisikan relasi "belongs-to".
     * Satu item pesanan (OrderItem) adalah milik satu produk (Product).
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
