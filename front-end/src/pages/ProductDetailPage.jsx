import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../App';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, updateCartCount } = useAuth(); 

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [addressText, setAddressText] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/api/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Produk tidak ditemukan atau terjadi kesalahan server.');
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleQuantityChange = (e) => {
        let newQuantity = parseInt(e.target.value, 10);
        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
        } else if (product && newQuantity > product.stock) {
            newQuantity = product.stock;
        }
        setQuantity(newQuantity);
    };

    const adjustQuantity = (amount) => {
        setQuantity(prev => {
            const newQuantity = prev + amount;
            if (newQuantity < 1) return 1;
            if (product && newQuantity > product.stock) return product.stock;
            return newQuantity;
        });
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: product.id,
                    qty: quantity 
                }),
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menambahkan produk.');
            }
            
            toast.success(`${product.name} berhasil ditambahkan!`, {
                position: 'top-right',
            });
            await updateCartCount(); 

        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error.message); 
        }
    };

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setCheckoutModalOpen(true);
    };

    const handleConfirmDirectCheckout = async () => {
        if (addressText.trim() === '') {
            toast.error("Alamat pengiriman tidak boleh kosong.");
            return;
        }

        setIsCheckingOut(true);
        try {
            const res = await fetch('http://localhost:8000/api/checkout/direct', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity,
                    address_text: addressText,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Gagal membuat pesanan.');

            toast.success('Pesanan berhasil dibuat!');
            updateCartCount(); 
            setCheckoutModalOpen(false); 
            navigate('/orders'); 

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (loading) return <div className="text-center py-10">Memuat...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    if (!product) return <div className="text-center py-10">Produk tidak ditemukan.</div>;

    return (
        <>
            <div className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="w-full h-auto aspect-square">
                        <ProductImage product={product} className="rounded-lg shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                        <p className="text-2xl text-blue-600 font-semibold mb-4">
                            Rp {parseInt(product.price).toLocaleString('id-ID')}
                        </p>
                        <div className="prose max-w-none mb-6">
                            <p>{product.description}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Stok tersisa: {product.stock}</p>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="quantity" className="font-semibold">Jumlah:</label>
                            <div className="flex items-center border rounded-md">
                                <button onClick={() => adjustQuantity(-1)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-l-md transition">-</button>
                                <input 
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-16 text-center border-y-0"
                                    min="1"
                                    max={product.stock}
                                />
                                <button onClick={() => adjustQuantity(1)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-r-md transition">+</button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleAddToCart} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                                Tambah ke Keranjang
                            </button>
                             <button onClick={handleCheckout} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300">
                                Checkout Langsung
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isCheckoutModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Konfirmasi Pesanan</h2>
                        <div className="mb-4">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
                            <textarea
                                id="address"
                                rows="4"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan alamat lengkap Anda..."
                                value={addressText}
                                onChange={(e) => setAddressText(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setCheckoutModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Batalkan
                            </button>
                            <button
                                onClick={handleConfirmDirectCheckout}
                                disabled={isCheckingOut}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                {isCheckingOut ? 'Memproses...' : 'Konfirmasi Pesanan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetailPage;