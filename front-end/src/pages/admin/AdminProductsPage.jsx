import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/admin/products', {
                credentials: 'include'
            });
            if(!res.ok) throw new Error('Gagal memuat produk');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if(!res.ok) throw new Error('Gagal menghapus produk');
           
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast.success('Produk berhasil dihapus!');
        } catch (error) {
            toast.error(error.message);
        }
    };

    if(loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Kelola Produk</h1>
                <Link to="/admin/products/new" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    + Tambah Produk
                </Link>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                                Gambar
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                                Nama Produk
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                                Harga
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                                Stok
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex-shrink-0 w-16 h-16">
                                        <img
                                            className="w-full h-full rounded-md object-cover"
                                            src={`http://localhost:8000/images/products/${product.image}`}
                                            alt={product.name} />
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">Rp {Number(product.price).toLocaleString('id-ID')}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{product.stock}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {product.is_active ? (
                                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                            <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                            <span className="relative">Aktif</span>
                                        </span>
                                    ) : (
                                        <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                                            <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                                            <span className="relative">Tidak Aktif</span>
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <Link to={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default AdminProductsPage;