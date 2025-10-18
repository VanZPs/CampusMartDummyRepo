import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import toast from 'react-hot-toast';
import EyeIcon from '../assets/icons/EyeIcon';
import EyeOffIcon from '../assets/icons/EyeOffIcon';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();


  useEffect(() => {
      if (location.state?.message) {
        toast.success(location.state.message);
        navigate(location.pathname, { replace: true, state: {} });
      }
      if (location.state?.email) {
        setEmail(location.state.email);
      }
    }, [location.state, navigate]);


  const validateForm = () => {
    if (!email) {
      toast.error('Email tidak boleh kosong');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Format email tidak valid');
      return false;
    }
    if (!password) {
      toast.error('Password tidak boleh kosong');
      return false;
    }
    if (password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; 
    }

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal! Periksa email/password.');
      }

      toast.success('Login berhasil!');
      login(data.user);

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login ke Akun Anda</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
         
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;