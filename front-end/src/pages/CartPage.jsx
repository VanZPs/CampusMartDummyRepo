import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import ProductImage from '../components/ProductImage';
import ConfirmationModal from '../components/ConfirmationModal';

const LoadingSpinner = () => <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>;
const ErrorMessage = ({ message }) => <div className="text-center py-10 px-6 bg-red-100 text-red-700 rounded-lg"><p>{message}</p></div>;

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [addressText, setAddressText] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const navigate = useNavigate();
    const { updateCartCount } = useAuth();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/cart', {
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Gagal mengambil data keranjang.');
            setCart(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, []);

    const updateQuantityOnServer = useCallback(async (itemId, newQty) => {
        try {
            const res = await fetch(`http://localhost:8000/api/cart/items/${itemId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ qty: newQty }),
            });
            const data = await res.json();
            if (!res.ok) {
                 throw new Error(data?.message || 'Gagal memperbarui jumlah.');
            }
            toast.success('Jumlah item diperbarui!');
        } catch (err) {
            toast.error(err.message);
            fetchCart();
        }
    }, []);

    const handleDebouncedUpdate = useCallback((itemId, newQty) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
            updateQuantityOnServer(itemId, newQty);
        }, 800);
        setDebounceTimer(timer);
    }, [debounceTimer, updateQuantityOnServer]);
    
    const handleQuantityChange = (itemId, value) => {
        const item = cart.items.find(i => i.id === itemId);
        if (!item) return;
        
        if (value === '' || /^[0-9]\d*$/.test(value)) {
            setCart(currentCart => ({
                ...currentCart,
                items: currentCart.items.map(i => i.id === itemId ? { ...i, qty: value } : i)
            }));
        }
    };

    const handleQuantityBlur = (itemId) => {
        const item = cart.items.find(i => i.id === itemId);
        if (!item) return;

        let finalQty = parseInt(item.qty, 10);
        
        if (isNaN(finalQty) || finalQty < 1) {
            if (finalQty === 0) toast.error("Jumlah minimal adalah 1.");
            finalQty = 1;
        } else if (finalQty > item.product.stock) {
            toast.error(`Stok tidak cukup! Maksimal ${item.product.stock}.`);
            finalQty = item.product.stock;
        }

        if (finalQty !== item.qty) {
            setCart(currentCart => ({
                ...currentCart,
                items: currentCart.items.map(i => i.id === itemId ? { ...i, qty: finalQty } : i)
            }));
        }
        updateQuantityOnServer(itemId, finalQty);
    };

    const adjustQuantity = (itemId, amount) => {
        const item = cart.items.find(i => i.id === itemId);
        if (!item) return;

        const currentQty = Number(item.qty) || 0;
        let newQty = currentQty + amount;

        if (newQty < 1) newQty = 1;
        if (newQty > item.product.stock) {
            newQty = item.product.stock;
            toast.error(`Stok tidak cukup! Maksimal ${item.product.stock}.`);
        }
        
        setCart(currentCart => ({
            ...currentCart,
            items: currentCart.items.map(i => i.id === itemId ? { ...i, qty: newQty } : i)
        }));
        
        handleDebouncedUpdate(itemId, newQty);
    };

    const handleDeleteItem = (itemId) => {
        setItemToDelete(itemId);
        setDeleteModalOpen(true);
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete || isDeleting) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`http://localhost:8000/api/cart/items/${itemToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });
            if (!res.ok) {
                 const data = await res.json().catch(() => ({}));
                 throw new Error(data?.message || 'Gagal menghapus item.');
            }

            setCart(currentCart => ({
                ...currentCart,
                items: currentCart.items.filter(item => item.id !== itemToDelete)
            }));
            
            setSelectedItems(currentSelected => {
                const newSelected = new Set(currentSelected);
                newSelected.delete(itemToDelete);
                return newSelected;
            });

            toast.success('Item berhasil dihapus.');
            updateCartCount();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
            setIsDeleting(false);
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(currentSelected => {
            const newSelected = new Set(currentSelected);
            if (newSelected.has(itemId)) newSelected.delete(itemId);
            else newSelected.add(itemId);
            return newSelected;
        });
    };

    const totalHarga = useMemo(() => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            if (selectedItems.has(item.id)) {
                const qty = Number(item.qty);
                if (!isNaN(qty) && qty > 0) {
                    return total + (item.product.price * qty);
                }
            }
            return total;
        }, 0);
    }, [cart, selectedItems]);

    const handleConfirmCheckout = async () => {
        if (addressText.trim() === '') {
            toast.error("Alamat pengiriman tidak boleh kosong.");
            return;
        }

        setIsCheckingOut(true);
        try {
            const res = await fetch('http://localhost:8000/api/checkout', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    address_text: addressText,
                    item_ids: Array.from(selectedItems),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Gagal membuat pesanan.');

            toast.success('Pesanan berhasil dibuat!');
            updateCartCount();
            setCheckoutModalOpen(false);
            setSelectedItems(new Set());
            await fetchCart();
            navigate('/orders');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mx-auto p-8"><ErrorMessage message={error} /></div>;

    const cartItems = cart?.items || [];

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Keranjang Belanja</h1>
                
                {cartItems.length === 0 ? (
                    <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700">Keranjang Anda kosong</h2>
                        <p className="text-gray-500 mt-2">Ayo mulai belanja dan temukan barang favoritmu!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                        >
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow-md">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded mr-4"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />
                                    <ProductImage product={item.product} className="w-20 h-20 object-cover rounded-md" />
                                    <div className="flex-grow mx-4">
                                        <p className="font-semibold text-lg text-gray-800">{item.product.name}</p>
                                        <p className="text-gray-600 font-bold">Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => adjustQuantity(item.id, -1)}
                                            className="px-3 py-1 bg-gray-200 rounded hover:bg-red-500 hover:text-white transition-colors duration-200"
                                            disabled={item.qty <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="text"
                                            value={item.qty}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            onBlur={() => handleQuantityBlur(item.id)}
                                            className="w-12 text-center border rounded"
                                        />
                                        <button
                                            onClick={() => adjustQuantity(item.id, 1)}
                                            className="px-3 py-1 bg-gray-200 rounded hover:bg-green-500 hover:text-white transition-colors duration-200"
                                            disabled={item.qty >= item.product.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-right ml-4 flex-shrink-0 w-32">
                                        <p className="text-gray-500 text-sm">Subtotal</p>
                                        <p className="font-bold text-lg text-gray-800">Rp {Number(item.product.price * item.qty).toLocaleString('id-ID')}</p>
                                    </div>
                                    <button onClick={() => handleDeleteItem(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
                                <h2 className="text-xl font-bold border-b pb-4 mb-4">Ringkasan Belanja</h2>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Total Harga ({selectedItems.size} item)</span>
                                    <span className="font-bold text-2xl text-gray-800">Rp {totalHarga.toLocaleString('id-ID')}</span>
                                </div>
                                <button
                                    onClick={() => setCheckoutModalOpen(true)}
                                    disabled={selectedItems.size === 0}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                message="Apakah Anda yakin ingin menghapus item ini?"
                onConfirm={confirmDeleteItem}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
            />
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
                                onClick={handleConfirmCheckout}
                                disabled={isCheckingOut}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                {isCheckingOut ? 'Memproses...' : 'Konfirmasi Pesanan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;