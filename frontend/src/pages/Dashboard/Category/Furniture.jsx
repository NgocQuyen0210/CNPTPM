import React from "react";
import "./furniture.css";
import { MdChair } from "react-icons/md";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/fu1/300/300", name: "Ghế gaming công thái học lưng cao có đèn RGB", price: 2890000, originalPrice: 4290000, discount: 33, sold: "1.2k+" },
  { id: 2, image: "https://picsum.photos/seed/fu2/300/300", name: "Bàn làm việc gỗ MDF chân sắt phong cách Bắc Âu", price: 1490000, originalPrice: 2190000, discount: 32, sold: "800+" },
  { id: 3, image: "https://picsum.photos/seed/fu3/300/300", name: "Kệ sách đứng 5 tầng gỗ thông tự lắp ráp", price: 890000, originalPrice: 1290000, discount: 31, sold: "2k+" },
  { id: 4, image: "https://picsum.photos/seed/fu4/300/300", name: "Sofa góc chữ L da công nghệ 3 chỗ ngồi", price: 6990000, originalPrice: 10490000, discount: 33, sold: "300+" },
  { id: 5, image: "https://picsum.photos/seed/fu5/300/300", name: "Giường ngủ gỗ có đầu giường bọc nệm 1m6", price: 3490000, originalPrice: 5190000, discount: 33, sold: "500+" },
  { id: 6, image: "https://picsum.photos/seed/fu6/300/300", name: "Đèn bàn học LED cảm ứng 3 chế độ sáng", price: 245000, originalPrice: 365000, discount: 33, sold: "5k+" },
  { id: 7, image: "https://picsum.photos/seed/fu7/300/300", name: "Tủ quần áo 2 cánh cửa trượt gương nội thất", price: 4290000, originalPrice: 6390000, discount: 33, sold: "400+" },
  { id: 8, image: "https://picsum.photos/seed/fu8/300/300", name: "Bộ bàn ăn 4 ghế gỗ sồi cao cấp phong cách", price: 3890000, originalPrice: 5790000, discount: 33, sold: "250+" },
  { id: 9, image: "https://picsum.photos/seed/fu9/300/300", name: "Thảm phòng khách lông ngắn mềm mịn 150x200", price: 580000, originalPrice: 860000, discount: 33, sold: "1.5k+" },
  { id: 10, image: "https://picsum.photos/seed/fu10/300/300", name: "Kệ TV treo tường gỗ chịu lực 80kg 2 tầng", price: 690000, originalPrice: 1030000, discount: 33, sold: "700+" },
];

function Furniture() {
  return (
    <div className="furniture-page">
      <div className="furniture-hero">
        <MdChair className="furniture-hero-icon" />
        <h1>Nội Thất</h1>
        <p>Đồ nội thất và trang trí gia đình</p>
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

export default Furniture;
