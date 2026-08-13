import React from "react";
import "./sport.css";
import { MdSportsSoccer } from "react-icons/md";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/sp1/300/300", name: "Giày chạy bộ Nike Air Zoom Pegasus 40", price: 2890000, originalPrice: 3990000, discount: 28, sold: "2k+" },
  { id: 2, image: "https://picsum.photos/seed/sp2/300/300", name: "Bóng đá Adidas FIFA World Cup size 5", price: 450000, originalPrice: 620000, discount: 27, sold: "3k+" },
  { id: 3, image: "https://picsum.photos/seed/sp3/300/300", name: "Áo thể thao nam khô nhanh chống tia UV", price: 185000, originalPrice: 260000, discount: 29, sold: "7k+" },
  { id: 4, image: "https://picsum.photos/seed/sp4/300/300", name: "Thảm yoga cao su tự nhiên 6mm chống trượt", price: 320000, originalPrice: 450000, discount: 29, sold: "5k+" },
  { id: 5, image: "https://picsum.photos/seed/sp5/300/300", name: "Tạ tay cao su 5kg cặp – dụng cụ tập gym", price: 210000, originalPrice: 290000, discount: 28, sold: "8k+" },
  { id: 6, image: "https://picsum.photos/seed/sp6/300/300", name: "Quần shorts thể thao nữ lưng cao chạy bộ", price: 145000, originalPrice: 210000, discount: 31, sold: "6k+" },
  { id: 7, image: "https://picsum.photos/seed/sp7/300/300", name: "Bình nước thể thao 1L BPA-free giữ nhiệt", price: 89000, originalPrice: 130000, discount: 32, sold: "10k+" },
  { id: 8, image: "https://picsum.photos/seed/sp8/300/300", name: "Dây nhảy thể dục có đếm số tốc độ cao", price: 65000, originalPrice: 95000, discount: 32, sold: "12k+" },
  { id: 9, image: "https://picsum.photos/seed/sp9/300/300", name: "Găng tay đấm bốc tập boxing 10oz da PU", price: 280000, originalPrice: 390000, discount: 28, sold: "1.8k+" },
  { id: 10, image: "https://picsum.photos/seed/sp10/300/300", name: "Vợt cầu lông YONEX Arcsaber 11 Pro chính hãng", price: 1890000, originalPrice: 2590000, discount: 27, sold: "600+" },
];

function Sport() {
  return (
    <div className="sport-page">
      <div className="sport-hero">
        <MdSportsSoccer className="sport-hero-icon" />
        <h1>Thể Thao</h1>
        <p>Dụng cụ và trang phục thể thao</p>
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

export default Sport;
