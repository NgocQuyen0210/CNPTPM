import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaArrowLeft } from "react-icons/fa";
import { useFavorite } from "../../../context/FavoriteContext";
import ProductCard from "../../../components/ProductCard/ProductCard";
import "./favorite.css";

function Favorite() {
  const { favorites } = useFavorite();
  const navigate = useNavigate();

  if (favorites.length === 0) {
    return (
      <div className="favorite-empty-container">
        <div className="favorite-empty">
          <FaHeart className="favorite-empty-icon" />
          <h2>Bạn chưa có sản phẩm yêu thích nào</h2>
          <p>Hãy thêm các sản phẩm bạn yêu thích để xem lại chúng ở đây nhé.</p>
          <button
            className="btn-continue-shopping"
            onClick={() => navigate("/dashboard/menu")}
          >
            <FaArrowLeft /> Trở về cửa hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-page">
      <div className="favorite-header">
        <h1>Sản Phẩm Yêu Thích</h1>
        <p>Bạn đã lưu <b>{favorites.length}</b> sản phẩm</p>
      </div>

      <div className="favorite-products-grid">
        {favorites.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

export default Favorite;
