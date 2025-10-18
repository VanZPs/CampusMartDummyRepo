import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeaderBackground from '../assets/header-background.svg';
import { useFadeIn } from "../useFadeIn";


const HomePage = () => {
  const [initialProducts, setInitialProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [isHeroVisible, heroRef] = useFadeIn();
  const [isCategoriesVisible, categoriesRef] = useFadeIn();
  const [isProductsVisible, productsRef] = useFadeIn();


  const navigate = useNavigate();
  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);


  // Fetch initial products and random categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:8000/api/products'),
          fetch('http://localhost:8000/api/categories/random')
        ]);


        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Gagal memuat data dari server.');
        }


        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();


        setInitialProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
 
  // Handle click outside of search to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchWrapperRef]);


  // Fungsi untuk fetch rekomendasi produk
  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/recommendations');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Gagal memuat rekomendasi:", error);
      setSuggestions([]);
    }
  };


  // Handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);


    if (query.length > 0) {
      try {
        const response = await fetch(`http://localhost:8000/api/products/search-suggestions?q=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Gagal memuat suggestion:", error);
        setSuggestions([]);
      }
    } else {
      fetchRecommendations();
    }
  };
 
  // Handle search focus
  const handleSearchFocus = () => {
      setIsSearchFocused(true);
      if (searchQuery === '' && suggestions.length === 0) {
        fetchRecommendations();
      }
  }


  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/products?q=${searchQuery}`);
    }
  };


  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };


  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    fetchRecommendations();
    searchInputRef.current?.focus();
  };


  // Fungsi untuk escape karakter spesial di RegExp
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };


  // Fungsi untuk highlight teks yang cocok
  const highlightMatch = (text, query) => {
    if (!query) {
      return text;
    }
    const safeQuery = escapeRegExp(query);
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    const parts = text.split(regex);
   
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? <strong key={index}>{part}</strong> : part
        )}
      </span>
    );
  };


  const welcomeText = "Selamat Datang di CampusMart!";
  const subtitleText = "Semua kebutuhanmu ada di sini, langsung dari tangan pertama.";


  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className={`relative z-10 text-center py-20 md:py-30 bg-gray-100 rounded-lg mb-6 bg-cover bg-center fade-in-section ${isHeroVisible ? 'is-visible' : ''}`}
        style={{ backgroundImage: `url(${HeaderBackground})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 flex items-center justify-center">
            <span className="animate-wave" aria-label={welcomeText}>
              {welcomeText.split("").map((char, index) => (
                <span key={index} style={{ animationDelay: `${index * 50}ms` }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="text-4xl md:text-5xl ml-4 animate-spin-pulse">🛍️</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-pulse-zoom text-gray-200">
            Semua kebutuhanmu ada di sini, langsung dari tangan pertama.
          </p>
         
          {/* Search Bar */}
          <div ref={searchWrapperRef} className="relative w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-5 pr-12 py-3 text-lg border-2 border-gray-300 rounded-full focus:border-blue-500 focus:ring-blue-500 transition"
                  placeholder="Cari produk atau kategori..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="flex-shrink-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
           
            {isSearchFocused && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl text-left">
                {suggestions.length > 0 ? (
                  suggestions.map(item => (
                    <Link
                      to={`/products?q=${item.name}`}
                      key={item.id}
                      className="block px-5 py-3 hover:bg-gray-100"
                      onClick={() => setIsSearchFocused(false)}
                    >
                      {highlightMatch(item.name, searchQuery)}
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-3 text-gray-500">Tidak ada saran</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
     
      {/* Categories Section */}
      <div
        ref={categoriesRef}
        className={`bg-white p-6 rounded-lg shadow-lg mb-6 fade-in-section ${isCategoriesVisible ? 'is-visible' : ''}`}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Kategori Populer:</h2>
        <div className="flex flex-wrap justify-start gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="px-6 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>


      {/* Initial Product List */}
      <div
        ref={productsRef}
        className={`bg-white p-6 rounded-lg shadow-lg fade-in-section ${isProductsVisible ? 'is-visible' : ''}`}
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Produk yang Tersedia:
        </h2>
        {loading && <p className="text-center">Memuat...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {initialProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default HomePage;