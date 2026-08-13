import React from "react";
import "./womanClothes.css";
import { GiDress } from "react-icons/gi";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/wc1/300/300", name: "Váy hoa nhí dáng xòe nữ tính dễ thương", price: 135000, originalPrice: 220000, discount: 39, sold: "9k+" },
  { id: 2, image: "https://picsum.photos/seed/wc2/300/300", name: "Áo croptop nữ form ôm tay phồng điệu đà", price: 75000, originalPrice: 130000, discount: 42, sold: "14k+" },
  { id: 3, image: "https://picsum.photos/seed/wc3/300/300", name: "Quần culottes nữ lưng cao ống rộng thanh lịch", price: 180000, originalPrice: 260000, discount: 31, sold: "6k+" },
  { id: 4, image: "https://picsum.photos/seed/wc4/300/300", name: "Đầm maxi boho nữ họa tiết cổ V quyến rũ", price: 245000, originalPrice: 380000, discount: 35, sold: "3k+" },
  { id: 5, image: "https://picsum.photos/seed/wc5/300/300", name: "Áo khoác blazer nữ dáng dài công sở", price: 310000, originalPrice: 490000, discount: 37, sold: "2k+" },
  { id: 6, image: "https://picsum.photos/seed/wc6/300/300", name: "Chân váy midi xếp ly phong cách Hàn", price: 145000, originalPrice: 230000, discount: 37, sold: "7k+" },
  { id: 7, image: "https://picsum.photos/seed/wc7/300/300", name: "Áo thun nữ in hình dễ thương cotton 4 chiều", price: 65000, originalPrice: 105000, discount: 38, sold: "18k+" },
  { id: 8, image: "https://picsum.photos/seed/wc8/300/300", name: "Bộ đồ bộ nữ mặc nhà thoải mái vải mịn", price: 120000, originalPrice: 180000, discount: 33, sold: "11k+" },
  { id: 9, image: "https://picsum.photos/seed/wc9/300/300", name: "Áo len nữ cổ lọ dệt kim mùa đông ấm", price: 195000, originalPrice: 290000, discount: 33, sold: "5k+" },
  { id: 10, image: "https://picsum.photos/seed/wc10/300/300", name: "Jumpsuit liền quần nữ ống suông cá tính", price: 265000, originalPrice: 400000, discount: 34, sold: "1k+" },
];

function WomanClothes() {
  return (
    <div className="woman-page">
      <div className="woman-hero">
        <GiDress className="woman-hero-icon" />
        <h1>Quần Áo Nữ</h1>
        <p>Bộ sưu tập thời trang nữ mới nhất</p>
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

export default WomanClothes;
