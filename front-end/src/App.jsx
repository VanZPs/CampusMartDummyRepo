import { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/ProductListPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import ProductForm from './components/admin/ProductForm';


// 1. Membuat Context untuk Autentikasi
const AuthContext = createContext(null);


// Komponen Provider untuk membungkus aplikasi
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);


  // Fungsi untuk update cart count dari komponen lain
  const updateCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.length || 0);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      setCartCount(0);
    }
  };


  useEffect(() => {
    // Cek status login saat aplikasi pertama kali dimuat
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/user", {
          credentials: "include",
        });


        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          const cartRes = await fetch("http://localhost:8000/api/cart", { credentials: "include" });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            setCartCount(cartData.items?.length || 0);
          }
        } else {
          setUser(null);
          setCartCount(0);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setUser(null);
        setCartCount(0);
      } finally {
        setLoading(false);
      }
    };


    checkLoginStatus();
  }, []);


  const login = (userData) => {
    setUser(userData);
    updateCartCount();
  };


  const logout = async () => {
    try {
        await fetch("http://localhost:8000/api/logout", {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setUser(null);
        setCartCount(0);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="text-blue-700 font-semibold text-lg">Memuat...</span>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, login, logout, cartCount, updateCartCount }}>
      {children}
    </AuthContext.Provider>
  );
};


// Hook kustom untuk mempermudah penggunaan context
export const useAuth = () => {
  return useContext(AuthContext);
};


// Komponen untuk melindungi Route
const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Rute pengunjung biasa */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductListPage />} />

              {/* Rute yang aktif setelah login/register */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrderPage />} />
              </Route>

              {/* Rute Khusus Admin */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:productId" element={<ProductForm />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                </Route>
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              marginTop: '40px'
            },
          }}
          containerStyle={{
            top: 40,
            right: 20,
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;