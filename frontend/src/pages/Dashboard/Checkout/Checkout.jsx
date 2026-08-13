import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import orderService from "../../../services/orderService";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingFullName: "",
    shippingPhone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
    shippingNote: ""
  });

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <button onClick={() => navigate("/dashboard/menu")} className="premium-btn">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        paymentMethod: paymentMethod,
        couponCode: null
      };
      await orderService.placeOrder(payload);
      alert("Đặt hàng thành công!");
      clearCart(); // Xóa giỏ hàng
      navigate("/dashboard/menu"); // Chuyển về trang chủ
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      
      {/* Form địa chỉ */}
      <div className="checkout-form-box">
        <h2>Thông tin giao hàng</h2>
        <form onSubmit={handleCheckout} className="checkout-form">
          
          <input required name="shippingFullName" value={form.shippingFullName} onChange={handleChange} placeholder="Họ tên người nhận" />
          <input required name="shippingPhone" value={form.shippingPhone} onChange={handleChange} placeholder="Số điện thoại" pattern="^[0-9]{10,11}$" title="Số điện thoại gồm 10-11 số" />
          
          <div className="form-row">
            <input required name="province" value={form.province} onChange={handleChange} placeholder="Tỉnh / Thành phố" />
            <input required name="district" value={form.district} onChange={handleChange} placeholder="Quận / Huyện" />
            <input required name="ward" value={form.ward} onChange={handleChange} placeholder="Phường / Xã" />
          </div>

          <input required name="detailAddress" value={form.detailAddress} onChange={handleChange} placeholder="Địa chỉ chi tiết (Số nhà, Tên đường...)" />
          <textarea name="shippingNote" value={form.shippingNote} onChange={handleChange} placeholder="Ghi chú thêm (Tùy chọn)" />

          <div className="payment-method-box">
            <strong>Phương thức thanh toán:</strong>
            <div className="payment-options-group">
              <label className={`payment-option-card ${paymentMethod === "COD" ? "active" : ""}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="COD" 
                  checked={paymentMethod === "COD"} 
                  onChange={() => setPaymentMethod("COD")} 
                />
                <div className="option-details">
                  <span className="option-title">Thanh toán khi nhận hàng (COD)</span>
                  <span className="option-desc">Thanh toán bằng tiền mặt khi nhân viên giao hàng đến nhà.</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === "BANK_TRANSFER" ? "active" : ""}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="BANK_TRANSFER" 
                  checked={paymentMethod === "BANK_TRANSFER"} 
                  onChange={() => setPaymentMethod("BANK_TRANSFER")} 
                />
                <div className="option-details">
                  <span className="option-title">Chuyển khoản Ngân hàng (Bank Transfer)</span>
                  <span className="option-desc">Thanh toán trực tuyến bằng cách quét mã QR hoặc chuyển khoản.</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-confirm-order">
            {loading ? "Đang xử lý..." : "XÁC NHẬN ĐẶT HÀNG"}
          </button>
        </form>
      </div>

      {/* Tóm tắt đơn hàng */}
      <div className="checkout-summary-box">
        <h2>Tóm tắt đơn hàng</h2>
        <div className="summary-items-list">
          {cart.map(item => (
            <div key={item.id} className="summary-item">
              <div className="summary-item-left">
                <img src={item.image} alt="img" className="summary-item-img" />
                <div>
                  <div className="summary-item-name">{item.name}</div>
                  <div className="summary-item-qty">Số lượng: {item.quantity}</div>
                </div>
              </div>
              <div className="summary-item-price">
                {(item.price * item.quantity).toLocaleString("vi-VN")}đ
              </div>
            </div>
          ))}
          
          <div className="checkout-total-row">
            <span>TỔNG CỘNG:</span>
            <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
