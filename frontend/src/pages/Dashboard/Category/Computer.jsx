import React from "react";
import "./computer.css";
import { FaLaptop } from "react-icons/fa";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/cp1/300/300", name: "Laptop ASUS VivoBook 15 Core i5-1235U 16GB/512GB", price: 13990000, originalPrice: 18490000, discount: 24, sold: "1.5k+" },
  { id: 2, image: "https://picsum.photos/seed/cp2/300/300", name: "MacBook Air M2 8GB/256GB – Midnight chính hãng", price: 26990000, originalPrice: 32990000, discount: 18, sold: "800+" },
  { id: 3, image: "https://picsum.photos/seed/cp3/300/300", name: "Dell Inspiron 15 3520 Core i7 16GB/512GB SSD", price: 16490000, originalPrice: 21990000, discount: 25, sold: "600+" },
  { id: 4, image: "https://picsum.photos/seed/cp4/300/300", name: "Lenovo IdeaPad Slim 5 Ryzen 7 16GB/512GB", price: 14990000, originalPrice: 19990000, discount: 25, sold: "900+" },
  { id: 5, image: "https://picsum.photos/seed/cp5/300/300", name: "HP Victus 15 Gaming RTX 4060 144Hz 16GB", price: 24990000, originalPrice: 31990000, discount: 22, sold: "400+" },
  { id: 6, image: "https://picsum.photos/seed/cp6/300/300", name: "Acer Aspire 3 Core i5 8GB/256GB SSD giá tốt", price: 9990000, originalPrice: 13490000, discount: 26, sold: "2k+" },
  { id: 7, image: "https://picsum.photos/seed/cp7/300/300", name: "MSI Gaming GF63 Thin RTX 4050 144Hz FHD", price: 19990000, originalPrice: 25990000, discount: 23, sold: "700+" },
  { id: 8, image: "https://picsum.photos/seed/cp8/300/300", name: "Màn hình LG 27\" 4K IPS 60Hz HDR10 chính hãng", price: 7490000, originalPrice: 9990000, discount: 25, sold: "1.2k+" },
  { id: 9, image: "https://picsum.photos/seed/cp9/300/300", name: "Bàn phím cơ Keychron K2 Pro Wireless RGB", price: 1890000, originalPrice: 2490000, discount: 24, sold: "3k+" },
  { id: 10, image: "https://picsum.photos/seed/cp10/300/300", name: "Chuột Logitech MX Master 3S Bluetooth 8000DPI", price: 1490000, originalPrice: 1990000, discount: 25, sold: "4k+" },
];

function Computer() {
  return (
    <div className="computer-page">
      <div className="computer-hero">
        <FaLaptop className="computer-hero-icon" />
        <h1>Máy Tính</h1>
        <p>Laptop, PC và phụ kiện máy tính</p>
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

export default Computer;
