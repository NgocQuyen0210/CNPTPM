import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../../../context/CartContext';
import './cart.css';

function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty">
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" />
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <button className="btn-continue-shopping" onClick={() => navigate('/dashboard/menu')}>
            <FaArrowLeft /> Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Giỏ Hàng</h1>
        <p>Bạn đang có <b>{totalItems}</b> sản phẩm trong giỏ hàng</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="product-col">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <span className="cart-item-name">{item.name}</span>
                  </td>
                  <td className="price-col">
                    {item.price.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="quantity-col">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.cartItemId, -1, item.quantity)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, 1, item.quantity)}>+</button>
                    </div>
                  </td>
                  <td className="subtotal-col">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="action-col">
                    <button className="btn-remove" onClick={() => removeFromCart(item.cartItemId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-summary">
          <h3>Tổng đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="summary-row">
            <span>Phí giao hàng:</span>
            <span>Miễn phí</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Tổng cộng:</span>
            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <button className="btn-checkout" onClick={() => navigate('/dashboard/checkout')}>
            Tiến hành thanh toán
          </button>
          <button className="btn-continue-shopping-outline" onClick={() => navigate('/dashboard/menu')}>
            <FaArrowLeft /> Mua thêm sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
