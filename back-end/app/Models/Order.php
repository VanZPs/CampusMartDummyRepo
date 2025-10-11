<?php
namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;




class Order extends Model
{
    use HasFactory;


    /**
     * Memberitahu Laravel untuk tidak mengelola kolom created_at dan updated_at.
     */
    protected $fillable = ['user_id', 'total', 'status', 'address_text'];


    /**
     * Mendefinisikan relasi ke User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }


    /**
     * Mendefinisikan relasi "one-to-many".
     * Satu pesanan (Order) memiliki banyak item pesanan (OrderItem).
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}