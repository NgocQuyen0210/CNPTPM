import apiClient from "./apiClient";

/**
 * Service quản lý các lệnh gọi API liên quan đến Product
 */
const productService = {
  /**
   * Lấy danh sách tất cả sản phẩm
   * @param {number|string} categoryId (optional)
   */
  getProducts: (categoryId) => {
    let url = "/products";
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    return apiClient.get(url);
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   * @param {number|string} productId 
   */
  getProductById: (productId) => {
    return apiClient.get(`/products/${productId}`);
  },

  /**
   * Tạo sản phẩm mới
   * @param {Object} data - Dữ liệu Product Request DTO chuẩn
   * @example
   * data = {
   *   "name": "Iphone 15 Pro Max",
   *   "slug": "iphone-15-pro-max",
   *   "summary": "Mô tả ngắn gọn",
   *   "content": "Nội dung chi tiết sản phẩm",
   *   "brand": "Apple",
   *   "price": 25000000.00,
   *   "featuredImage": "link-anh.png",
   *   "categoryId": 1,
   *   "supplierId": 1
   * }
   */
  createProduct: (data) => {
    return apiClient.post("/products", data);
  },

  /**
   * Cập nhật thông tin sản phẩm
   * @param {number|string} productId 
   * @param {Object} data - Dữ liệu mới (cấu trúc tương tự createProduct)
   */
  updateProduct: (productId, data) => {
    return apiClient.put(`/products/${productId}`, data);
  },

  /**
   * Xóa một sản phẩm
   * @param {number|string} productId 
   */
  deleteProduct: (productId) => {
    return apiClient.delete(`/products/${productId}`);
  },
};

export default productService;
