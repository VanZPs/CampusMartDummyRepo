import React from 'react';
import { useAuth } from '../../App';
import HeaderBackground from '../../assets/header-background.svg';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  const welcomeText = `Selamat Datang, ${user ? user.name : 'Admin'}!`;

  return (
    <div>
      <div
        className="relative text-left p-10 md:p-12 bg-gray-100 rounded-lg mb-6 bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${HeaderBackground})` }}
      >
        <div className="absolute inset-0 bg-black opacity-60 rounded-lg"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="animate-wave" aria-label={welcomeText}>
              {welcomeText.split("").map((char, index) => (
                <span key={index} style={{ animationDelay: `${index * 50}ms` }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </h1>
          <p className="text-lg text-gray-200 animate-pulse-zoom-yellow">
            Pilih menu di samping untuk mulai mengelola toko.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg">Statistik Cepat</h3>
          <p className="text-gray-600 mt-2">Konten statistik akan datang...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg">Aktivitas Terbaru</h3>
          <p className="text-gray-600 mt-2">Log aktivitas akan datang...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;