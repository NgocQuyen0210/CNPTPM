import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../../services/productService";
import { useCart } from "../../../context/CartContext";
import "./product.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart } = useCart();

  // Pre-order Modal States
  const [showPreorderModal, setShowPreorderModal] = useState(false);
  const [preorderForm, setPreorderForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: ""
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (showPreorderModal) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setPreorderForm(prev => ({
          ...prev,
          fullName: user.fullName || "",
          email: user.email || ""
        }));
      }
    }
  }, [showPreorderModal]);

  const fetchProduct = async () => {
    try {
      const res = await productService.getProductById(id);
      setProduct(res);
      if (res && res.variants && res.variants.length > 0) {
        setSelectedVariant(res.variants[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVariantsLabel = () => {
    if (!product || !product.categoryId) return "Chọn phiên bản:";
    const catId = product.categoryId;
    if (catId === 1 || catId === 4 || catId === 5) {
      return "Chọn phiên bản (Dung lượng - Màu sắc):";
    } else if (catId === 2) {
      return "Chọn cấu hình (RAM - SSD - CPU):";
    } else if (catId === 8 || catId === 9 || catId === 10 || catId === 6 || catId === 7) {
      return "Chọn kích thước (Size):";
    }
    return "Chọn màu sắc / phân loại:";
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!product) return <div className="loading-container">Sản phẩm không tồn tại.</div>;

  const handleAddToCart = async () => {
    try {
      await addToCart({ id: product.id }, quantity, selectedVariant?.id);
      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart({ id: product.id }, quantity, selectedVariant?.id);
      navigate("/dashboard/checkout");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPreorder = (e) => {
    e.preventDefault();
    if (!preorderForm.fullName.trim() || !preorderForm.phone.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên và Số điện thoại!");
      return;
    }
    alert(`Đặt trước hàng thành công cho sản phẩm ${product.name}! Chúng tôi sẽ liên hệ với bạn qua số điện thoại ${preorderForm.phone} ngay khi sản phẩm có hàng.`);
    setShowPreorderModal(false);
    setPreorderForm({
      fullName: "",
      phone: "",
      email: "",
      notes: ""
    });
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        
        {/* Cột Trái: Ảnh */}
        <div className="product-gallery">
          <img 
            src={product.featuredImage || "https://via.placeholder.com/400"} 
            alt={product.name} 
            className="detail-img"
          />
        </div>

        {/* Cột Phải: Thông tin */}
        <div className="product-meta">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0 }}>{product.name}</h1>
            {product.status === "COMING_SOON" ? (
              <span className="status-badge coming-soon" style={{ padding: "6px 12px", fontSize: "12.5px" }}>Hàng sắp về</span>
            ) : product.status === "OUT_OF_STOCK" ? (
              <span className="status-badge out-of-stock" style={{ padding: "6px 12px", fontSize: "12.5px" }}>Đã hết</span>
            ) : (
              <span className="status-badge selling" style={{ padding: "6px 12px", fontSize: "12.5px" }}>Đang bán</span>
            )}
          </div>
          <div className="detail-price">
            {selectedVariant ? selectedVariant.price?.toLocaleString("vi-VN") : product.price?.toLocaleString("vi-VN")}đ
          </div>
          
          <div className="detail-info-box">
            <p><strong>Thương hiệu:</strong> {product.brand || "Đang cập nhật"}</p>
            <p><strong>Mô tả ngắn:</strong> {product.summary || "Chưa có mô tả"}</p>
          </div>

          {/* Hộp chọn Variant đặc trưng (Màu sắc, Dung lượng, Cấu hình, Size) */}
          {product.variants && product.variants.length > 0 && (
            <div className="product-variants-wrapper">
              <span className="variants-label">{getVariantsLabel()}</span>
              <div className="variants-list">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={`variant-item-btn ${selectedVariant?.id === v.id ? "selected" : ""}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hiển thị số lượng chỉ khi đang bán */}
          {(!product.status || product.status === "SELLING") && (
            <div className="quantity-control-wrapper">
              <span className="quantity-label">Số lượng:</span>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          )}

          <div className="actions-wrapper">
            {product.status === "COMING_SOON" ? (
              <button onClick={() => setShowPreorderModal(true)} className="btn-preorder-detail">
                Đặt trước
              </button>
            ) : product.status === "OUT_OF_STOCK" ? (
              <div className="out-of-stock-message">Sản phẩm hiện đã hết hàng</div>
            ) : (
              <>
                <button onClick={handleAddToCart} className="btn-add-cart-detail">
                  Thêm vào giỏ hàng
                </button>
                <button onClick={handleBuyNow} className="btn-buy-now-detail">
                  Mua ngay
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="detail-specs-box">
        <h2>Chi tiết sản phẩm</h2>
        <div className="specs-content">
          {product.content || "Nội dung chi tiết đang được cập nhật."}
        </div>
      </div>

      {/* Pre-order Modal */}
      {showPreorderModal && (
        <div className="preorder-modal-backdrop" onClick={() => setShowPreorderModal(false)}>
          <div className="preorder-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Đăng ký đặt trước sản phẩm</h2>
            <p className="preorder-sub">Vui lòng để lại thông tin của bạn. Chúng tôi sẽ liên hệ ngay khi có hàng.</p>
            
            <form onSubmit={handleSubmitPreorder} className="preorder-form">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input 
                  type="text" 
                  value={preorderForm.fullName} 
                  onChange={(e) => setPreorderForm({...preorderForm, fullName: e.target.value})}
                  required 
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input 
                  type="tel" 
                  value={preorderForm.phone} 
                  onChange={(e) => setPreorderForm({...preorderForm, phone: e.target.value})}
                  required 
                  placeholder="Nhập số điện thoại để liên hệ"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={preorderForm.email} 
                  onChange={(e) => setPreorderForm({...preorderForm, email: e.target.value})}
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea 
                  value={preorderForm.notes} 
                  onChange={(e) => setPreorderForm({...preorderForm, notes: e.target.value})}
                  placeholder="Ghi chú thêm (số lượng cần mua, thời gian liên hệ...)"
                  rows="3"
                />
              </div>
              
              <div className="preorder-actions">
                <button type="button" onClick={() => setShowPreorderModal(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-confirm">Xác nhận đặt trước</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
