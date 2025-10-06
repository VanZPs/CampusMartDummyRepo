import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';


const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/admin/products', {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Gagal memuat produk');
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);


    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            const res = await fetch(`http://localhost:8000/api/admin/products/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Gagal menghapus produk.');
            setProducts(products.filter(p => p.id !== id));
            toast.success('Produk berhasil dihapus!');
        } catch (error) {
            toast.error(error.message);
        }
    };
   
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    if (loading) return <div>Loading...</div>;


    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex flex-row justify-between w-full mb-1 sm:mb-0">
                    <h2 className="text-2xl leading-tight">
                        Kelola Produk
                    </h2>
                    <Link to="/admin/products/add" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        + Tambah Produk
                    </Link>
                </div>


                <div className="my-4">
                    <input
                        type="text"
                        placeholder="Cari nama produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>


                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Gambar</th>
                                    <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Nama Produk</th>
                                    <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Harga</th>
                                    <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Stok</th>
                                    <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
                                    <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-5 py-5 border-b text-sm">
                                            <div className="flex-shrink-0 w-16 h-16">
                                                <img className="w-full h-full rounded-md object-cover" src={`http://localhost:8000/images/products/${product.image}`} alt={product.name} />
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b text-sm">{product.name}</td>
                                        <td className="px-5 py-5 border-b text-sm">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                                        <td className="px-5 py-5 border-b text-sm">{product.stock}</td>
                                        <td className="px-5 py-5 border-b text-sm">
                                            {product.is_active ? (
                                                <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">Aktif</span>
                                            ) : (
                                                <span className="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full">Tidak Aktif</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-5 border-b text-sm">
                                            <Link to={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AdminProductsPage;