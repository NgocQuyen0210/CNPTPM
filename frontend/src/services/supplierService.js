import apiClient from "./apiClient";

const supplierService = {
  getAll: () => {
    return apiClient.get("/suppliers");
  },
  getById: (id) => {
    return apiClient.get(`/suppliers/${id}`);
  },
  create: (data) => {
    return apiClient.post("/suppliers", data);
  },
  update: (id, data) => {
    return apiClient.put(`/suppliers/${id}`, data);
  },
  delete: (id) => {
    return apiClient.delete(`/suppliers/${id}`);
  }
};

export default supplierService;
