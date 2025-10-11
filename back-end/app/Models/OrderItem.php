<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class OrderItem extends Model
{
    use HasFactory;


    public $timestamps = false;
    protected $fillable = ['order_id', 'product_id', 'price', 'qty', 'subtotal'];


    /**
     * Mendefinisikan relasi ke Product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }


    /**
     * Mendefinisikan relasi ke Order.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}