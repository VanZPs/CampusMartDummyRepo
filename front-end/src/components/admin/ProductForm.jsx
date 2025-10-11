import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductImage from '../ProductImage';


const MAX_IMAGE_MB = 2;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];


const ProductForm = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(productId);


    const [product, setProduct] = useState({
        name: '', price: '', stock: '', category_id: '', is_active: null,
    });
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);


    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);


    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catRes = await fetch('http://localhost:8000/api/categories/random');
                const catData = await catRes.json();
                setCategories(catData || []);


                if (isEditing) {
                    const prodRes = await fetch(`http://localhost:8000/api/admin/products`, { credentials: 'include' });
                    const allProducts = await prodRes.json();
                    const currentProduct = Array.isArray(allProducts)
                        ? allProducts.find(p => p.id === parseInt(productId))
                        : null;


                    if (currentProduct) {
                        currentProduct.is_active = Boolean(currentProduct.is_active);
                        setProduct({
                            name: currentProduct.name ?? '',
                            price: currentProduct.price ?? '',
                            stock: currentProduct.stock ?? '',
                            category_id: currentProduct.category_id ?? '',
                            is_active: currentProduct.is_active,
                        });
                        if (currentProduct.image) {
                            setImagePreview(`http://localhost:8000/images/products/${currentProduct.image}`);
                        }
                    }
                }
            } catch (error) {
                toast.error('Gagal memuat data awal.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [productId, isEditing]);


    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'category_id' && value === '__CREATE_NEW__') {
            setShowNewCategoryInput(true);
            setProduct(prev => ({ ...prev, category_id: value }));
            return;
        }
        if (name === 'category_id') {
            setShowNewCategoryInput(false);
        }
        setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };


    const handleStatusSelect = (val) => {
        setProduct(prev => ({ ...prev, is_active: val }));
    };


    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;


        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Format gambar harus PNG, JPG, atau GIF.');
            e.target.value = '';
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            toast.error(`Ukuran gambar maksimal ${MAX_IMAGE_MB}MB.`);
            e.target.value = '';
            return;
        }


        setImageFile(file);
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(URL.createObjectURL(file));
    };


    const handleSaveNewCategory = async () => {
        if (!newCategoryName || newCategoryName.trim() === '') {
            toast.error('Nama kategori tidak boleh kosong.');
            return;
        }
        try {
            const res = await fetch('http://localhost:8000/api/admin/categories', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name: newCategoryName.trim() }),
            });
            const newCategory = await res.json();
            if (!res.ok) throw new Error(newCategory?.message || 'Gagal membuat kategori.');


            toast.success(`Kategori "${newCategory.name}" berhasil dibuat!`);
            setCategories(prev => [...prev, newCategory]);
            setProduct(prev => ({ ...prev, category_id: newCategory.id }));
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (error) {
            toast.error(error.message);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product.category_id || product.category_id === '__CREATE_NEW__') {
            toast.error('Silakan pilih kategori yang valid.');
            return;
        }
        if (product.is_active === null) {
            toast.error('Pilih status produk (Aktif / Nonaktif).');
            return;
        }


        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('stock', product.stock);
        formData.append('category_id', product.category_id);
        formData.append('is_active', product.is_active ? 1 : 0);
        if (imageFile) formData.append('image', imageFile);
        if (isEditing) formData.append('_method', 'POST');


        const url = isEditing
            ? `http://localhost:8000/api/admin/products/${productId}`
            : 'http://localhost:8000/api/admin/products';


        try {
            const res = await fetch(url, { method: 'POST', credentials: 'include', body: formData });
            if (!res.ok) {
                let message = 'Gagal menyimpan produk.';
                try {
                    const errorData = await res.json();
                    message = errorData?.message || message;
                } catch (_) {}
                throw new Error(message);
            }
            toast.success(`Produk berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}!`);
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.message);
        }
    };
   
    const getStatusConfig = () => {
        switch (product.is_active) {
            case true:
                return {
                    label: 'Aktif',
                    bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
                    indicatorPosition: 'translate-x-14',
                    textColor: 'text-green-600',
                    icon: '✓'
                };
            case false:
                return {
                    label: 'Nonaktif',
                    bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
                    indicatorPosition: 'translate-x-0',
                    textColor: 'text-red-600',
                    icon: '✕'
                };
            default:
                return {
                    label: 'Belum dipilih',
                    bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500',
                    indicatorPosition: 'translate-x-7',
                    textColor: 'text-gray-600',
                    icon: '?'
                };
        }
    };

    const QuantityInput = ({ value, onChange }) => {
        const handleAdjust = (amount) => {
            const newValue = Math.max(0, parseInt(value || 0, 10) + amount);
            onChange({ target: { name: 'stock', value: newValue } });
        };

        return (
            <div className="flex items-stretch border border-gray-300 rounded-md overflow-hidden w-32">
                <button 
                    type="button"
                    onClick={() => handleAdjust(-1)} 
                    className="px-3 py-1 bg-gray-200 text-gray-800 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                    disabled={value <= 0}
                >
                    -
                </button>
                <input 
                    type="number"
                    name="stock"
                    value={value}
                    onChange={onChange}
                    className="w-full text-center font-semibold bg-gray-50 text-gray-900 border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    min="0"
                />
                <button 
                    type="button"
                    onClick={() => handleAdjust(1)} 
                    className="px-3 py-1 bg-gray-200 text-gray-800 transition-colors hover:bg-green-500 hover:text-white"
                >
                    +
                </button>
            </div>
        );
    };

    const statusConfig = getStatusConfig();
   
    if (loading) return <div>Loading form...</div>;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Baris 1: Nama Produk & Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name" 
                            value={product.name} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select 
                            id="category_id"
                            name="category_id" 
                            value={product.category_id} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            <option value="__CREATE_NEW__" className="font-bold text-blue-600">-- Tambah Kategori Baru --</option>
                        </select>
                    </div>
                </div>
                {showNewCategoryInput && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700">Nama Kategori Baru</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Contoh: Makanan Ringan" className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={handleSaveNewCategory} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">Simpan</button>
                        </div>
                    </div>
                )}

                {/* Baris 2: Harga & Stok */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                        <input 
                            type="number" 
                            id="price"
                            name="price" 
                            value={product.price} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required 
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                        <QuantityInput value={product.stock} onChange={handleChange} />
                    </div>
                </div>

                {/* Baris 3: Gambar & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                        <div className="mt-2 flex items-center space-x-6">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg bg-gray-100 shadow-md"/>
                            ) : (
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            )}
                            <div>
                                <input ref={fileInputRef} type="file" name="image" accept={ALLOWED_TYPES.join(',')} onChange={handleImageChange} className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    {imagePreview ? 'Ubah Gambar' : 'Pilih Gambar'}
                                </button>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (MAX. {MAX_IMAGE_MB}MB)</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Status Produk <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className={`w-24 h-10 rounded-full transition-all duration-500 ease-in-out ${statusConfig.bgColor} shadow-inner`}>
                                <div className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-500 ease-in-out ${statusConfig.indicatorPosition} flex items-center justify-center`}>
                                    <span className="text-sm font-bold text-gray-700">{statusConfig.icon}</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => handleStatusSelect(false)} className="absolute left-0 top-0 w-7 h-10 opacity-0 cursor-pointer" aria-label="Nonaktif" />
                            <button type="button" onClick={() => handleStatusSelect(null)} className="absolute left-7 top-0 w-8 h-10 opacity-0 cursor-pointer" aria-label="Belum dipilih" />
                            <button type="button" onClick={() => handleStatusSelect(true)} className="absolute left-16 top-0 w-7 h-10 opacity-0 cursor-pointer" aria-label="Aktif" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${product.is_active === true ? 'bg-green-500' : product.is_active === false ? 'bg-red-500' : 'bg-gray-400'}`} />
                            <span className={`text-sm font-medium transition-colors duration-300 ${statusConfig.textColor}`}>{statusConfig.label}</span>
                        </div>
                    </div>
                </div>
                
                <div className="border-t pt-6 flex justify-end space-x-4">
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Simpan</button>
                </div>
            </form>
        </div>
    );
};


export default ProductForm;