import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EyeIcon from '../assets/icons/EyeIcon';
import EyeOffIcon from '../assets/icons/EyeOffIcon';

const RegisterPage = () => {
const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return false;
    }
    if (!email.trim()) {
      toast.error('Email tidak boleh kosong');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Format email tidak valid');
      return false;
    }
    if (password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return false;
    }
    if (password !== passwordConfirmation) {
      toast.error('Konfirmasi password tidak cocok');
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
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0][0];
          throw new Error(firstError);
        }
        throw new Error(data.message || 'Registrasi gagal!');
      }

      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.', email: email } });

    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Buat Akun Baru</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input id="name" type="text" required className="w-full px-3 py-2 mt-1 border rounded-md" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
            <input id="email" type="email" required className="w-full px-3 py-2 mt-1 border rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input id="password" type={showPassword ? 'text' : 'password'} required className="w-full px-3 py-2 border rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>

          {/* Password Confirmation Input */}
          <div>
            <label htmlFor="password-confirmation" className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <div className="relative mt-1">
              <input id="password-confirmation" type={showPasswordConfirmation ? 'text' : 'password'} required className="w-full px-3 py-2 border rounded-md" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
              <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}>
                {showPasswordConfirmation ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Daftar
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;