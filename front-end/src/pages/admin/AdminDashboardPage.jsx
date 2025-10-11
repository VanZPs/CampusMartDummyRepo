import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../App';
import HeaderBackground from '../../assets/header-background.svg';


// --- Komponen-komponen Baru untuk Tampilan (Telah Ditingkatkan) ---


const StatCard = ({ title, value, icon, colorClass, iconBgClass }) => (
    <div className={`relative p-4 rounded-xl shadow flex items-center transition-transform duration-300 hover:scale-105 ${colorClass}`}>
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-white text-2xl mr-4 ${iconBgClass}`}>
            {icon}
        </div>
        <div>
            <div className="text-sm font-medium opacity-80">{title}</div>
            <div className="text-2xl font-bold">{value ?? '-'}</div>
        </div>
    </div>
);


const ActivityLogItem = ({ order, isLast }) => (
    <div className="relative pl-8">
        {/* Lingkaran Timeline dan Ikon */}
        <div className="absolute left-0 top-1 flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
            🛒
        </div>
        {/* Garis Vertikal Timeline (jangan tampilkan untuk item terakhir) */}
        {!isLast && (
            <div className="absolute left-3 top-8 bottom-0 w-px bg-gray-200"></div>
        )}
        <div className="ml-4 pb-8">
            <p className="font-semibold text-gray-800 text-sm">
                <span className="text-blue-600">{order.user.name}</span> baru saja membuat pesanan baru!
            </p>
            <p className="text-xs text-gray-500 mt-1">
                ID: #{order.id} • Total: Rp {Number(order.total).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-400 mt-2">
                {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
        </div>
    </div>
);


const PaginationControls = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.total <= pagination.per_page) return null;


    return (
        <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-gray-600">
                Hal {pagination.current_page} dari {pagination.last_page}
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    &laquo;
                </button>
                <button
                    onClick={() => onPageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    &raquo;
                </button>
            </div>
        </div>
    );
};


// --- Komponen Skeleton untuk Loading State ---


const SkeletonStatCard = () => (
    <div className="p-4 rounded-xl shadow bg-gray-200 animate-pulse">
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
            <div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
                <div className="h-6 w-10 bg-gray-300 rounded mt-2"></div>
            </div>
        </div>
    </div>
);


const SkeletonActivity = () => (
     <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-start">
                 <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                 <div className="ml-6 flex-grow">
                     <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                     <div className="h-3 bg-gray-300 rounded w-1/2 mt-2"></div>
                 </div>
             </div>
        ))}
     </div>
);




// --- Komponen Utama Halaman Dashboard ---


const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activityLog, setActivityLog] = useState(null);
    const [loading, setLoading] = useState(true);


    const fetchData = useCallback(async (page = 1) => {
        // Hanya set loading untuk call pertama atau saat refresh, bukan saat ganti halaman
        if (page === 1) {
            setLoading(true);
        }
        try {
            const res = await fetch(`http://localhost:8000/api/admin/dashboard?page=${page}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Gagal memuat data dashboard');
            const data = await res.json();
            setStats(data.statistics);
            setActivityLog(data.activity_log);
        } catch (error) {
            toast.error(error.message);
        } finally {
            if (page === 1) {
                setLoading(false);
            }
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleRefresh = () => {
        toast.success('Memuat ulang data...');
        fetchData(1); // Kembali ke halaman 1 saat refresh
    };


    const handlePageChange = (newPage) => {
        // Set activityLog jadi null agar pagination hilang saat data baru diambil
        setActivityLog(null);
        fetchData(newPage);
    };


    const welcomeText = `Selamat Datang, ${user ? user.name : 'Admin'}!`;


    return (
        <div className="space-y-8">
            {/* Header */}
            <div
                className="relative text-left p-8 bg-gray-800 rounded-xl overflow-hidden text-white"
                style={{ backgroundImage: `url(${HeaderBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2">
                            <span className="animate-wave" aria-label={welcomeText}>
                                {welcomeText.split("").map((char, index) => (
                                    <span key={index} style={{ animationDelay: `${index * 50}ms` }}>
                                    {char === " " ? "\u00A0" : char}
                                    </span>
                                ))}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-300 animate-pulse-zoom-yellow">
                            Pilih menu di samping untuk mulai mengelola toko.
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white flex-shrink-0"
                        title="Refresh Data"
                    >
                        <svg
                            className={`w-6 h-6 transition-transform duration-500 ease-out ${loading ? 'animate-spin-reverse' : 'group-hover:-rotate-180'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8z" />
                        </svg>
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Kiri: Statistik */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
                        <h2 className="text-xl font-bold mb-4 border-b pb-3">Ringkasan Statistik</h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                            </div>
                        ) : (
                            <>
                                {/* Statistik Produk */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3">Produk</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <StatCard title="Total Produk" value={stats?.products.total} icon="📦" colorClass="bg-blue-50 text-blue-800" iconBgClass="bg-blue-500" />
                                        <StatCard
                                            title="Produk Aktif"
                                            value={stats?.products.active}
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            }
                                            colorClass="bg-green-50 text-green-800"
                                            iconBgClass="bg-green-500"
                                        />
                                        <StatCard
                                            title="Tidak Aktif"
                                            value={stats?.products.inactive}
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            }
                                            colorClass="bg-red-50 text-red-800"
                                            iconBgClass="bg-red-500"
                                        />
                                    </div>
                                </div>


                                {/* Statistik Pesanan */}
                                <div className="mt-8">
                                    <h3 className="font-semibold text-gray-700 mb-3">Pesanan</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <StatCard title="Total" value={stats?.orders.total} icon="🛒" colorClass="bg-indigo-50 text-indigo-800" iconBgClass="bg-indigo-500" />
                                        <StatCard title="Diproses" value={stats?.orders.processed} icon="⏳" colorClass="bg-yellow-50 text-yellow-800" iconBgClass="bg-yellow-500" />
                                        <StatCard title="Dikirim" value={stats?.orders.shipped} icon="🚚" colorClass="bg-cyan-50 text-cyan-800" iconBgClass="bg-cyan-500" />
                                        <StatCard title="Selesai" value={stats?.orders.completed} icon="🎉" colorClass="bg-emerald-50 text-emerald-800" iconBgClass="bg-emerald-500" />
                                        <StatCard title="Batal" value={stats?.orders.cancelled} icon="🗑️" colorClass="bg-rose-50 text-rose-800" iconBgClass="bg-rose-500" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>


                {/* Kolom Kanan: Aktivitas Terbaru */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
                        <h2 className="text-xl font-bold mb-4 border-b pb-3">Aktivitas Terbaru</h2>
                        {!activityLog ? (
                            <SkeletonActivity />
                        ) : activityLog && activityLog.data.length > 0 ? (
                            <>
                                <div className="mt-4">
                                    {activityLog.data.map((order, index) => (
                                        <ActivityLogItem
                                            key={order.id}
                                            order={order}
                                            isLast={index === activityLog.data.length - 1}
                                        />
                                    ))}
                                </div>
                                <PaginationControls pagination={activityLog} onPageChange={handlePageChange} />
                            </>
                        ) : (
                            <p className="text-gray-500 text-sm mt-4 text-center py-8">
                                Belum ada aktivitas terbaru.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AdminDashboardPage;