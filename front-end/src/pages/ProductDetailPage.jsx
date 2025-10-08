import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { UserContext } from '../App'; // Asumsi UserContext diekspor dari App.jsx


const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, fetchCartCount } = useContext(UserContext);


    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


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
        } else if (newQuantity > product.stock) {
            newQuantity = product.stock;
        }
        setQuantity(newQuantity);
    };


    const adjustQuantity = (amount) => {
        setQuantity(prev => {
            const newQuantity = prev + amount;
            if (newQuantity < 1) return 1;
            if (newQuantity > product.stock) return product.stock;
            return newQuantity;
        });
    };


    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }


        try {
            const response = await fetch('http://localhost:8000/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity
                }),
                credentials: 'include'
            });


            if (!response.ok) throw new Error('Gagal menambahkan ke keranjang');


            await fetchCartCount();
            alert(`${product.name} berhasil ditambahkan ke keranjang!`);


        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.message);
        }
    };


    const handleCheckout = async () => {
         if (!user) {
            navigate('/login');
            return;
        }
        await handleAddToCart();
        navigate('/cart');
    }




    if (loading) return <div className="text-center py-10">Memuat...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    if (!product) return <div className="text-center py-10">Produk tidak ditemukan.</div>;


    return (
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
    );
};


export default ProductDetailPage;