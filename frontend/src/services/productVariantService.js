import apiClient from "./apiClient";

const productVariantService = {
  getAll: () => {
    return apiClient.get("/product-variants");
  },
  getByProductId: (productId) => {
    return apiClient.get(`/product-variants/product/${productId}`);
  },
  create: (data) => {
    return apiClient.post("/product-variants", data);
  },
  update: (id, data) => {
    return apiClient.put(`/product-variants/${id}`, data);
  },
  delete: (id) => {
    return apiClient.delete(`/product-variants/${id}`);
  }
};

export default productVariantService;
