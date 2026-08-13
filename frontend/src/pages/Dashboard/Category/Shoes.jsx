import React from "react";
import "./shoes.css";
import { GiRunningShoe } from "react-icons/gi";
import ProductCard from "../../../components/ProductCard/ProductCard";

const products = [
  { id: 1, image: "https://picsum.photos/seed/sh1/300/300", name: "Giày sneaker nam Nike Air Force 1 trắng full", price: 1890000, originalPrice: 2590000, discount: 27, sold: "6k+" },
  { id: 2, image: "https://picsum.photos/seed/sh2/300/300", name: "Giày thể thao nữ Adidas Ultraboost 23 đen", price: 2490000, originalPrice: 3490000, discount: 29, sold: "4k+" },
  { id: 3, image: "https://picsum.photos/seed/sh3/300/300", name: "Dép sandal nam da bò handmade cổ điển", price: 380000, originalPrice: 540000, discount: 30, sold: "3k+" },
  { id: 4, image: "https://picsum.photos/seed/sh4/300/300", name: "Giày cao gót nữ mũi nhọn da patent 7cm", price: 495000, originalPrice: 720000, discount: 31, sold: "2k+" },
  { id: 5, image: "https://picsum.photos/seed/sh5/300/300", name: "Boot chelsea da nam cổ ngắn đế cao su bền", price: 890000, originalPrice: 1290000, discount: 31, sold: "1.5k+" },
  { id: 6, image: "https://picsum.photos/seed/sh6/300/300", name: "Giày lười loafer nữ da mềm đế bằng đi học", price: 345000, originalPrice: 490000, discount: 30, sold: "8k+" },
  { id: 7, image: "https://picsum.photos/seed/sh7/300/300", name: "Giày chạy bộ Asics Gel-Nimbus 25 êm ái", price: 3290000, originalPrice: 4590000, discount: 28, sold: "900+" },
  { id: 8, image: "https://picsum.photos/seed/sh8/300/300", name: "Dép tổ ong Crocs Classic clog nhiều màu", price: 590000, originalPrice: 850000, discount: 31, sold: "5k+" },
  { id: 9, image: "https://picsum.photos/seed/sh9/300/300", name: "Giày bata vải canvas nam nữ unisex basic", price: 185000, originalPrice: 265000, discount: 30, sold: "12k+" },
  { id: 10, image: "https://picsum.photos/seed/sh10/300/300", name: "Giày thể thao Puma Suede Classic màu xanh", price: 1290000, originalPrice: 1790000, discount: 28, sold: "2.5k+" },
];

function Shoes() {
  return (
    <div className="shoes-page">
      <div className="shoes-hero">
        <GiRunningShoe className="shoes-hero-icon" />
        <h1>Giày Dép</h1>
        <p>Giày, dép và các phụ kiện cho đôi chân</p>
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

export default Shoes;
