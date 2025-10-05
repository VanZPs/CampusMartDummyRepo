import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

// Komponen untuk ikon panah (chevron) yang bisa berputar
const ChevronIcon = ({ isOpen }) => (
  <svg
    className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
 
  // State untuk mengontrol visibilitas menu, defaultnya terbuka
  const [isMenuOpen, setMenuOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Styling untuk link sub-menu dengan shadow dan warna latar
  const getSubNavLinkClass = ({ isActive }) =>
    `block w-full text-left pl-4 pr-2 py-2.5 rounded-md text-base transition-all duration-300 shadow-sm ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white hover:shadow-md'
    }`;

  return (
    <div className="flex min-h-screen font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 text-gray-200 p-4 flex flex-col">

        {/* Tombol Pemicu Dropdown */}
        <nav className="flex-grow">
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="w-full flex items-center justify-between mb-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl font-bold text-white">Admin Menu</span>
            <ChevronIcon isOpen={isMenuOpen} />
          </button>

          {/* Kontainer Sub-menu yang bisa disembunyikan */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isMenuOpen ? 'max-h-60' : 'max-h-0'
            }`}
          >
            <ul className="space-y-2">
              <li>
                <NavLink to="/admin" end className={getSubNavLinkClass}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/products" className={getSubNavLinkClass}>
                  Produk
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/orders" className={getSubNavLinkClass}>
                  Pesanan
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        {/* Tombol Logout */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 bg-red-800 hover:bg-red-700 rounded-lg transition-all duration-300 font-semibold text-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 p-5 bg-gray-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;