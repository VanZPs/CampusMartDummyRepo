import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    diproses: 'text-orange-600 font-semibold',
    dikirim: 'text-yellow-600 font-semibold',
    selesai: 'text-green-600 font-semibold',
    dibatalkan: 'text-red-600 font-semibold',
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/orders', { credentials: 'include' });
      if (!res.ok) throw new Error('Gagal memuat pesanan');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
        const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus }),
        });
        if(!res.ok) throw new Error('Gagal update status');


        const updatedOrder = await res.json();
        setOrders(prevOrders =>
            prevOrders.map(o => o.id === orderId ? updatedOrder : o)
        );
        toast.success(`Status pesanan #${orderId} diubah!`);
    } catch (error) {
        toast.error(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
            <div className="flex flex-row justify-between w-full mb-1 sm:mb-0">
                <h2 className="text-3xl font-bold leading-tight">
                    Kelola Pesanan
                </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">ID Pesanan</th>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Pemesan</th>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Total</th>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td className="px-5 py-5 border-b text-sm">#{order.id}</td>
                            <td className="px-5 py-5 border-b text-sm">{order.user.name}</td>
                            <td className="px-5 py-5 border-b text-sm">Rp {Number(order.total).toLocaleString('id-ID')}</td>
                            <td className="px-5 py-5 border-b text-sm">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`form-select appearance-none block w-full px-3 py-1.5 text-base font-normal bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none ${statusColors[order.status] || 'text-gray-700'}`}
                              >
                                <option value="diproses">Diproses</option>
                                <option value="dikirim">Dikirim</option>
                                <option value="selesai">Selesai</option>
                                <option value="dibatalkan">Dibatalkan</option>
                              </select>
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

export default AdminOrdersPage;