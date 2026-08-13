import apiClient from "./apiClient";

const categoryService = {
  getAll: () => {
    return apiClient.get("/categories");
  },
  
  getById: (id) => {
    return apiClient.get(`/categories/${id}`);
  },

  create: (data) => {
    return apiClient.post("/categories", data);
  },

  update: (id, data) => {
    return apiClient.put(`/categories/${id}`, data);
  },

  delete: (id) => {
    return apiClient.delete(`/categories/${id}`);
  }
};

export default categoryService;
