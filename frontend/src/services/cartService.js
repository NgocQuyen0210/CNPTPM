import apiClient from "./apiClient";
import authService from "./authService";

const getAuthHeaders = () => {
  const user = authService.getUser();
  if (user && user.id) {
    return { "User-ID": user.id };
  }
  return {};
};

const cartService = {
  getCart: () => {
    return apiClient.get("/cart", { headers: getAuthHeaders() });
  },

  addToCart: (productId, variantId, quantity) => {
    const data = { productId, variantId, quantity };
    return apiClient.post("/cart/items", data, { headers: getAuthHeaders() });
  },

  updateQuantity: (itemId, quantity) => {
    return apiClient.put(`/cart/items/${itemId}?quantity=${quantity}`, null, { headers: getAuthHeaders() });
  },

  removeItem: (itemId) => {
    return apiClient.delete(`/cart/items/${itemId}`, { headers: getAuthHeaders() });
  }
};

export default cartService;
