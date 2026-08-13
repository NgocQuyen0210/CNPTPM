import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import authService from '../services/authService';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    const user = authService.getUser();
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const res = await cartService.getCart();
      if (res && res.items) {
        // Map data từ API về format chung của Context
        const mappedItems = res.items.map(item => ({
          cartItemId: item.id, // ID của record trong bảng CartItem
          id: item.variantId || item.id, // Dùng tạm id
          name: item.productName || item.variantName,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));
        setCart(mappedItems);
      }
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng từ API:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1, variantId = null) => {
    const user = authService.getUser();
    if (!user) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng");
      return;
    }
    try {
      await cartService.addToCart(product.id, variantId, quantity);
      await fetchCart(); // Cập nhật lại giỏ hàng
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      alert("Lỗi thêm vào giỏ hàng: " + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      fetchCart();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", error);
    }
  };

  const updateQuantity = async (cartItemId, amount, currentQuantity) => {
    const newQuantity = currentQuantity + amount;
    if (newQuantity < 1) return;
    try {
      await cartService.updateQuantity(cartItemId, newQuantity);
      fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    fetchCart, // Xuất bản thêm hàm fetchCart để cập nhật giỏ hàng sau khi login
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
