import React from "react";
import "./menClothes.css";
import { GiShirt } from "react-icons/gi";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/mc1/300/300", name: "Áo thun nam form rộng basic thoáng mát", price: 89000, originalPrice: 145000, discount: 39, sold: "10k+" },
  { id: 2, image: "https://picsum.photos/seed/mc2/300/300", name: "Quần jean nam skinny co giãn 4 chiều", price: 175000, originalPrice: 260000, discount: 33, sold: "5k+" },
  { id: 3, image: "https://picsum.photos/seed/mc3/300/300", name: "Áo hoodie nam nỉ bông dày dặn ấm áp", price: 230000, originalPrice: 350000, discount: 34, sold: "8k+" },
  { id: 4, image: "https://picsum.photos/seed/mc4/300/300", name: "Áo polo nam cổ bẻ cao cấp SYMBOL", price: 120000, originalPrice: 200000, discount: 40, sold: "12k+" },
  { id: 5, image: "https://picsum.photos/seed/mc5/300/300", name: "Quần short nam thể thao lưng thun", price: 65000, originalPrice: 110000, discount: 41, sold: "20k+" },
  { id: 6, image: "https://picsum.photos/seed/mc6/300/300", name: "Áo sơ mi nam dài tay vải linen mát", price: 185000, originalPrice: 280000, discount: 34, sold: "3k+" },
  { id: 7, image: "https://picsum.photos/seed/mc7/300/300", name: "Quần jogger nam thun cotton thoải mái", price: 99000, originalPrice: 160000, discount: 38, sold: "7k+" },
  { id: 8, image: "https://picsum.photos/seed/mc8/300/300", name: "Áo khoác nam gió nhẹ chống nắng UPF50", price: 210000, originalPrice: 320000, discount: 34, sold: "4k+" },
  { id: 9, image: "https://picsum.photos/seed/mc9/300/300", name: "Áo ba lỗ nam thun gân vải dày form body", price: 55000, originalPrice: 90000, discount: 39, sold: "15k+" },
  { id: 10, image: "https://picsum.photos/seed/mc10/300/300", name: "Quần tây nam công sở slim fit lịch lãm", price: 260000, originalPrice: 380000, discount: 32, sold: "2k+" },
];

function MenClothes() {
  return (
    <div className="men-page">
      <div className="men-hero">
        <GiShirt className="men-hero-icon" />
        <h1>Quần Áo Nam</h1>
        <p>Bộ sưu tập thời trang nam mới nhất</p>
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

export default MenClothes;
