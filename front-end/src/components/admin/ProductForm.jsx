import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';


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
    const statusConfig = getStatusConfig();
   
    if (loading) return <div>Loading form...</div>;


    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                    <input type="text" name="name" value={product.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Harga</label>
                    <input type="number" name="price" value={product.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                    <input type="number" name="stock" value={product.stock} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select name="category_id" value={product.category_id} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        <option value="__CREATE_NEW__" className="font-bold text-blue-600">-- Tambah Kategori Baru --</option>
                    </select>
                </div>
                {showNewCategoryInput && (
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700">Nama Kategori Baru</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Contoh: Makanan Ringan" className="block w-full rounded-md border-gray-300 shadow-sm" />
                            <button type="button" onClick={handleSaveNewCategory} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap">Simpan Kategori</button>
                        </div>
                    </div>
                )}


                <div>
                    <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                    <div className="mt-2 flex items-center space-x-6">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-md bg-gray-100" />
                        ) : (
                            <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">Tanpa Gambar</div>
                        )}
                        <div className="flex flex-col">
                            <input ref={fileInputRef} type="file" name="image" accept={ALLOWED_TYPES.join(',')} onChange={handleImageChange} className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                {isEditing ? 'Ubah Gambar' : 'Pilih Gambar'}
                            </button>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (MAX. {MAX_IMAGE_MB}MB)</p>
                        </div>
                    </div>
                </div>


                <div className="flex flex-col space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Status Produk <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <div className={`w-24 h-10 rounded-full transition-all duration-500 ease-in-out ${statusConfig.bgColor} shadow-lg`}>
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
                    <p className="text-xs text-gray-500">Pilih status produk. Wajib dipilih.</p>
                </div>
               
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                </div>
            </form>
        </div>
    );
};


export default ProductForm;