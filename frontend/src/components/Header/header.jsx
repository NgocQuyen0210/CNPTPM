import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaHeart, FaUserCircle, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useFavorite } from "../../context/FavoriteContext";
import authService from "../../services/authService";
import productService from "../../services/productService";
import "./header.css";

function Header() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalFavorites } = useFavorite();
  const [user, setUser] = useState(authService.getUser());

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(authService.getUser());
    };
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  // Search and Autocomplete States
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    productService.getProducts()
      .then(res => setProducts(res || []))
      .catch(err => console.error("Lỗi tải sản phẩm cho tìm kiếm:", err));
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim() !== "") {
      setShowSuggestions(false);
      navigate(`/dashboard/menu?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSuggestionClick = (prodId) => {
    setSearchTerm("");
    setShowSuggestions(false);
    navigate(`/dashboard/product/${prodId}`);
  };

  const suggestions = searchTerm.trim() === "" ? [] : products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5);

  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo">
        <h1 onClick={() => navigate("/dashboard/menu")}>E-SHOP</h1>
      </div>

      {/* Nav links */}
      <nav className="header-nav">
        <ul>
          <li>
            <NavLink
              to="/dashboard/menu"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/about"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Giới thiệu
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/contact"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Liên hệ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/orders"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Đơn hàng
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/favorite"
              className={({ isActive }) => (isActive ? "active cart-link" : "cart-link")}
            >
              <FaHeart className="cart-icon" />
              Yêu thích
              {totalFavorites > 0 && <span className="cart-badge">{totalFavorites}</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              id="header-cart-icon"
              to="/dashboard/cart"
              className={({ isActive }) => (isActive ? "active cart-link" : "cart-link")}
            >
              <FaShoppingCart className="cart-icon" />
              Giỏ hàng
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Search bar */}
      <div className="header-search-wrapper" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="header-search-form">
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="header-search-input"
          />
          <button type="submit" className="header-search-btn" title="Tìm kiếm">
            <FaSearch />
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions-dropdown">
            {suggestions.map((s) => (
              <div 
                key={s.id} 
                className="suggestion-item"
                onClick={() => handleSuggestionClick(s.id)}
              >
                <img 
                  src={s.featuredImage || "https://via.placeholder.com/50"} 
                  alt={s.name} 
                  className="suggestion-img" 
                />
                <div className="suggestion-info">
                  <div className="suggestion-name">{s.name}</div>
                  <div className="suggestion-price">{s.price?.toLocaleString("vi-VN")}đ</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth buttons */}
      <div className="header-auth">
        {/* Nút bật tắt Dark Mode */}
        <button 
          className="btn-theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Chuyển sang Chế độ sáng" : "Chuyển sang Chế độ tối"}
        >
          {darkMode ? <FaSun className="theme-toggle-icon sun" /> : <FaMoon className="theme-toggle-icon moon" />}
        </button>

        {user ? (
          <>
            <div className="user-profile-badge" onClick={() => navigate("/dashboard/profile")} style={{ cursor: "pointer" }} title="Quản lý tài khoản">
              <FaUserCircle className="user-avatar-icon" />
              <span className="user-greeting">{user.fullName || user.username}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" /> Đăng xuất
            </button>
          </>
        ) : (
          <>
            <button className="btn-login" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
            <button className="btn-signup" onClick={() => navigate("/sign-up")}>
              Đăng ký
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
