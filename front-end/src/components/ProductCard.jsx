import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import ProductImage from './ProductImage';


const ProductCard = ({ product, className, style }) => {
  const navigate = useNavigate();
  const { updateCartCount } = useAuth();


  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:8000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: productId,
          qty: 1,
        }),
      });


      if (response.status === 401) {
        navigate('/login');
        return;
      }


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan produk ke keranjang.');
      }
     
      toast.success(`${product.name} berhasil ditambahkan ke keranjang!`, {
        position: 'top-right',
        duration: 3000
      });
      updateCartCount();


    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message);
    }
  };


  return (
    // --- PERUBAHAN DI SINI ---
    <div
      className={`border rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
      style={style}
    >
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="cursor-pointer"
      >
        <ProductImage
          product={product}
          className="w-full h-48 object-cover mb-4 rounded-md"
        />
        <h3 className="text-lg font-semibold mb-2 h-14 overflow-hidden">{product.name}</h3>
        <p className="text-gray-700 mb-1">Rp {Number(product.price).toLocaleString('id-ID')}</p>
        <p className="text-sm text-gray-500 mb-4">Stok: {product.stock}</p>
      </div>
      <button
        onClick={() => handleAddToCart(product.id)}
        className="w-full mt-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
        disabled={product.stock === 0}
      >
        {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  );
};


export default ProductCard;