import React, { useState } from "react";
import "./ProductCard.css";
import { FaHeart, FaShoppingCart, FaBolt } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useFavorite } from "../../context/FavoriteContext";

import { useNavigate } from "react-router-dom";

import { getRealProductImage, getFallbackImage } from "../../services/imageService";

function ProductCard({ id, image, featuredImage, name, price, originalPrice, discount, sold, status, brand, categoryId }) {
  const navigate = useNavigate();
  const [cartMsg, setCartMsg] = useState(false);
  const [buyMsg, setBuyMsg] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();

  const isLiked = isFavorite(id);
  const productObj = { id, image, featuredImage, name, brand, categoryId };
  const displayImage = getRealProductImage(productObj);

  const handleFavorite = () => {
    toggleFavorite({ id, image: displayImage, name, price, originalPrice, discount, sold, status });
  };

  const handleCart = async () => {
    try {
      await addToCart({ id, name, price, image: displayImage });
      setCartMsg(true);
      setTimeout(() => setCartMsg(false), 1500);
    } catch (err) {
      console.error("Cart error in ProductCard:", err);
    }
  };

  const handleBuy = async () => {
    try {
      await addToCart({ id, name, price, image: displayImage });
      navigate("/dashboard/checkout");
    } catch (err) {
      console.error("Buy error in ProductCard:", err);
    }
  };

  return (
    <div className="product-card" onClick={() => navigate(`/dashboard/product/${id}`)} style={{ cursor: "pointer" }}>
      {/* ===== ẢNH + OVERLAY ICONS ===== */}
      <div className="product-image-wrapper">
        <img 
          src={displayImage} 
          alt={name} 
          className="product-img" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getFallbackImage(productObj);
          }}
        />
        {discount && <span className="product-discount">-{discount}%</span>}

        <div className="product-actions">
          <button
            className={`action-btn favorite-btn ${isLiked ? "liked" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
            title="Yêu thích"
          >
            <FaHeart />
            <span className="action-tooltip">Yêu thích</span>
          </button>

          {(!status || status === "SELLING") && (
            <>
              <button
                className={`action-btn cart-btn ${cartMsg ? "active-flash" : ""}`}
                onClick={(e) => { e.stopPropagation(); handleCart(); }}
                title="Thêm vào giỏ"
              >
                <FaShoppingCart />
                <span className="action-tooltip">Giỏ hàng</span>
              </button>

              <button
                className={`action-btn buy-btn ${buyMsg ? "active-flash" : ""}`}
                onClick={(e) => { e.stopPropagation(); handleBuy(); }}
                title="Mua ngay"
              >
                <FaBolt />
                <span className="action-tooltip">Mua ngay</span>
              </button>
            </>
          )}
        </div>

        {cartMsg && <div className="product-toast cart-toast">✓ Đã thêm vào giỏ!</div>}
        {buyMsg && <div className="product-toast buy-toast">⚡ Đang mua ngay...</div>}
      </div>

      {/* ===== THÔNG TIN SẢN PHẨM ===== */}
      <div className="product-info">
        <p className="product-name">{name}</p>
        <div className="product-pricing">
          <span className="product-price">{price.toLocaleString("vi-VN")}đ</span>
          {originalPrice && (
            <span className="product-original">
              {originalPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
        {status === "COMING_SOON" ? (
          <span className="status-badge coming-soon">Hàng sắp về</span>
        ) : status === "OUT_OF_STOCK" ? (
          <span className="status-badge out-of-stock">Đã hết</span>
        ) : (
          <span className="status-badge selling">Đang bán</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
