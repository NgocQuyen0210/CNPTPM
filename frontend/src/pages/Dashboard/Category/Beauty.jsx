import React from "react";
import "./beauty.css";
import { GiLipstick } from "react-icons/gi";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/bt1/300/300", name: "Son môi lì Maybelline SuperStay 24H màu đỏ", price: 145000, originalPrice: 210000, discount: 31, sold: "15k+" },
  { id: 2, image: "https://picsum.photos/seed/bt2/300/300", name: "Kem dưỡng ẩm Neutrogena Hydro Boost 50ml", price: 320000, originalPrice: 460000, discount: 30, sold: "8k+" },
  { id: 3, image: "https://picsum.photos/seed/bt3/300/300", name: "Nước tẩy trang L'Oreal Micellar 400ml", price: 175000, originalPrice: 250000, discount: 30, sold: "20k+" },
  { id: 4, image: "https://picsum.photos/seed/bt4/300/300", name: "Phấn nước Laneige Neo Cushion Matte SPF42", price: 690000, originalPrice: 980000, discount: 30, sold: "5k+" },
  { id: 5, image: "https://picsum.photos/seed/bt5/300/300", name: "Serum Vitamin C The Ordinary 20% 30ml", price: 285000, originalPrice: 410000, discount: 30, sold: "11k+" },
  { id: 6, image: "https://picsum.photos/seed/bt6/300/300", name: "Mascara Benefit They're Real màu đen dài mi", price: 390000, originalPrice: 560000, discount: 30, sold: "6k+" },
  { id: 7, image: "https://picsum.photos/seed/bt7/300/300", name: "Kem chống nắng Anessa Perfect UV SPF50+ 60g", price: 420000, originalPrice: 600000, discount: 30, sold: "9k+" },
  { id: 8, image: "https://picsum.photos/seed/bt8/300/300", name: "Tẩy tế bào chết môi Sugar Kiss ETUDE House", price: 95000, originalPrice: 135000, discount: 30, sold: "14k+" },
  { id: 9, image: "https://picsum.photos/seed/bt9/300/300", name: "Bộ cọ trang điểm 12 cây Real Techniques", price: 480000, originalPrice: 690000, discount: 30, sold: "3k+" },
  { id: 10, image: "https://picsum.photos/seed/bt10/300/300", name: "Xịt khoáng dưỡng ẩm Vichy Mineralizing Water", price: 210000, originalPrice: 300000, discount: 30, sold: "7k+" },
];

function Beauty() {
  return (
    <div className="beauty-page">
      <div className="beauty-hero">
        <GiLipstick className="beauty-hero-icon" />
        <h1>Làm Đẹp</h1>
        <p>Mỹ phẩm và sản phẩm chăm sóc sắc đẹp</p>
      </div>

      <div className="products-section">
        <h2 className="products-section-title">Sản phẩm nổi bật</h2>
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Beauty;
