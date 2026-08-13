import apiClient from "./apiClient";
import authService from "./authService";

const getAuthHeaders = () => {
  const user = authService.getUser();
  if (user && user.id) {
    return { "User-ID": user.id };
  }
  return {};
};

const orderService = {
  placeOrder: (data) => {
    return apiClient.post("/orders", data, { headers: getAuthHeaders() });
  },

  getOrderHistory: () => {
    return apiClient.get("/orders", { headers: getAuthHeaders() });
  },

  getOrderById: (id) => {
    return apiClient.get(`/orders/${id}`, { headers: getAuthHeaders() });
  }
};

export default orderService;
