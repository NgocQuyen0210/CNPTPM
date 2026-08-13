import React from "react";
import "./mobilePhone.css";
import { FaMobileAlt } from "react-icons/fa";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/mp1/300/300", name: "iPhone 15 Pro Max 256GB – Titanium Black", price: 28900000, originalPrice: 34990000, discount: 17, sold: "1.2k+" },
  { id: 2, image: "https://picsum.photos/seed/mp2/300/300", name: "Samsung Galaxy S24 Ultra 512GB chính hãng", price: 25990000, originalPrice: 31990000, discount: 19, sold: "900+" },
  { id: 3, image: "https://picsum.photos/seed/mp3/300/300", name: "Xiaomi 14 5G 256GB – Snapdragon 8 Gen3", price: 13490000, originalPrice: 17990000, discount: 25, sold: "3k+" },
  { id: 4, image: "https://picsum.photos/seed/mp4/300/300", name: "OPPO Find X7 5G 256GB – Camera Hasselblad", price: 14990000, originalPrice: 19990000, discount: 25, sold: "700+" },
  { id: 5, image: "https://picsum.photos/seed/mp5/300/300", name: "Realme 12 Pro+ 5G 256GB – màn 120Hz", price: 8990000, originalPrice: 11990000, discount: 25, sold: "4k+" },
  { id: 6, image: "https://picsum.photos/seed/mp6/300/300", name: "Vivo V30e 5G 8GB/256GB – sạc 80W", price: 7490000, originalPrice: 9490000, discount: 21, sold: "2k+" },
  { id: 7, image: "https://picsum.photos/seed/mp7/300/300", name: "Samsung Galaxy A55 5G 128GB – thiết kế mới", price: 8990000, originalPrice: 11490000, discount: 22, sold: "5k+" },
  { id: 8, image: "https://picsum.photos/seed/mp8/300/300", name: "Xiaomi Redmi Note 13 Pro 4G 256GB", price: 5990000, originalPrice: 7990000, discount: 25, sold: "8k+" },
  { id: 9, image: "https://picsum.photos/seed/mp9/300/300", name: "iPhone 14 128GB – Like New bảo hành 12T", price: 16990000, originalPrice: 22990000, discount: 26, sold: "2.3k+" },
  { id: 10, image: "https://picsum.photos/seed/mp10/300/300", name: "Google Pixel 8a 128GB – AI camera Pro", price: 11990000, originalPrice: 15490000, discount: 23, sold: "500+" },
];

function MobilePhone() {
  return (
    <div className="mobile-page">
      <div className="mobile-hero">
        <FaMobileAlt className="mobile-hero-icon" />
        <h1>Điện Thoại</h1>
        <p>Các dòng điện thoại thông minh mới nhất</p>
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

export default MobilePhone;
