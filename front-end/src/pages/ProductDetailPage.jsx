import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
        const value = e.target.value;
        if (value === '' || /^[0-9]\d*$/.test(value)) {
            const numValue = value === '' ? '' : parseInt(value, 10);

            if (product && numValue > product.stock) {
                toast.error(`Stok tidak cukup! Maksimal pembelian ${product.stock}.`);
                setQuantity(product.stock);
            } else {
                setQuantity(numValue);
            }
        }
    };

    const handleQuantityBlur = () => {
        if (quantity === '' || quantity < 1) {
            if (quantity === 0) {
                 toast.error("Jumlah minimal adalah 1.");
            }
            setQuantity(1);
        }
    };

    const adjustQuantity = (amount) => {
        const currentQuantity = Number(quantity) || 0;
        let newQuantity = currentQuantity + amount;
        
        if (newQuantity < 1) {
            newQuantity = 1;
        }
        if (product && newQuantity > product.stock) {
            newQuantity = product.stock;
            toast.error(`Stok tidak cukup! Maksimal pembelian ${product.stock}.`);
        }
        setQuantity(newQuantity);
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (quantity < 1 || quantity === '') {
            toast.error("Jumlah tidak valid.");
            setQuantity(1);
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
            
            toast.success(`${product.name} berhasil ditambahkan!`);
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
        if (quantity < 1 || quantity === '') {
            toast.error("Jumlah tidak valid.");
            setQuantity(1);
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
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/2 flex justify-center items-center">
                            <div className="w-full max-w-md bg-gray-100 rounded-xl p-4">
                                <ProductImage 
                                    product={product} 
                                    className="w-full h-auto object-contain aspect-square" 
                                />
                            </div>
                        </div>

                        <div className="md:w-1/2 flex flex-col justify-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                                {product.name}
                            </h1>
                            <p className="text-3xl text-blue-600 font-bold mb-2">
                                Rp {parseInt(product.price).toLocaleString('id-ID')}
                            </p>
                            {product.category && (
                                <div className="mb-4">
                                    <Link 
                                        to={`/products?category=${product.category.id}`} 
                                        className="inline-block bg-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-300"
                                    >
                                        {product.category.name}
                                    </Link>
                                </div>
                            )}
                            <p className="text-md text-gray-700 mb-2 font-medium">
                                Stok tersisa: <span className="text-black font-bold">{product.stock}</span>
                            </p>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <label htmlFor="quantity" className="font-semibold text-lg">Jumlah:</label>
                                <div className="flex items-stretch border border-gray-400 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={() => adjustQuantity(-1)} 
                                        className="px-3 py-1 bg-gray-200 text-gray-800 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                                        disabled={quantity <= 1 || (product && product.stock === 0)}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="text"
                                        id="quantity"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        className="w-16 text-center bg-gray-100 text-gray-900 border-x border-gray-400 focus:outline-none"
                                        disabled={product && product.stock === 0}
                                    />
                                    <button 
                                        onClick={() => adjustQuantity(1)} 
                                        className="px-3 py-1 bg-gray-200 text-gray-800 transition-colors hover:bg-green-500 hover:text-white disabled:opacity-50"
                                        disabled={product && quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <button onClick={handleAddToCart} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400" disabled={product.stock === 0}>
                                    Tambah ke Keranjang
                                </button>
                                <button onClick={handleCheckout} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300 disabled:bg-gray-400" disabled={product.stock === 0}>
                                    Checkout Langsung
                                </button>
                            </div>
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