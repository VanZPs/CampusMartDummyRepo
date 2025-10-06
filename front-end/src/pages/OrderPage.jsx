import React, { useState, useEffect } from 'react';
import ProductImage from '../components/ProductImage';


// Komponen Pembantu
const LoadingSpinner = () => <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>;
const ErrorMessage = ({ message }) => <div className="text-center py-10 px-6 bg-red-100 text-red-700 rounded-lg"><p>{message}</p></div>;


const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fungsi untuk mengambil riwayat pesanan
  const fetchOrders = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/orders', {
          credentials: 'include',
        });
      if (!response.ok) {
        throw new Error('Gagal memuat riwayat pesanan. Silakan login terlebih dahulu.');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);


  const getStatusClass = (status) => {
    switch (status) {
      case 'diproses': return 'bg-yellow-100 text-yellow-800';
      case 'dikirim': return 'bg-blue-100 text-blue-800';
      case 'selesai': return 'bg-green-100 text-green-800';
      case 'dibatalkan': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container mx-auto p-8"><ErrorMessage message={error} /></div>;


  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Riwayat Pesanan Saya</h1>


        {orders.length === 0 ? (
          <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">Anda belum memiliki pesanan</h2>
            <p className="text-gray-500 mt-2">Semua pesanan yang Anda buat akan muncul di sini.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Pesanan #{order.id}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                     <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                     <p className="font-bold text-lg text-gray-800 mt-1">Rp {Number(order.total).toLocaleString('id-ID')}</p>
                  </div>
                </div>


                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-1">Alamat Pengiriman</h3>
                    <p className="text-gray-600">{order.address_text}</p>
                  </div>
                 
                  <h3 className="font-semibold text-gray-700 mb-2">Item yang Dipesan</h3>
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center">
                        <ProductImage product={item.product} className="w-16 h-16 object-cover rounded-md" />
                        <div className="flex-grow mx-4">
                          <p className="font-semibold text-gray-800">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.qty} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="font-semibold text-gray-700">Rp {Number(item.qty * item.price).toLocaleString('id-ID')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default OrderPage;