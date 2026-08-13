import apiClient from "./apiClient";

/**
 * Service quản lý các lệnh gọi API liên quan đến User
 */
const userService = {
  /**
   * Lấy danh sách tất cả người dùng
   */
  getUsers: () => {
    return apiClient.get("/users");
  },

  /**
   * Tạo người dùng mới (Register)
   * @param {Object} data - Dữ liệu người dùng cần tạo
   * @example
   * data = {
   *   "username": "duy",
   *   "email": "duy.it@example.com",
   *   "password": "duy123456",
   *   "confirmPassword": "duy123456",
   *   "fullName": "Trương Văn Duy"
   * }
   */
  createUser: (data) => {
    return apiClient.post("/users", data);
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {number|string} userId - ID của người cần update
   * @param {Object} data - Dữ liệu mới (giống DTO của create)
   */
  updateUser: (userId, data) => {
    return apiClient.put(`/users/${userId}`, data);
  },

  /**
   * Xóa người dùng
   * @param {number|string} userId - ID của người dùng cần xóa
   */
  deleteUser: (userId) => {
    return apiClient.delete(`/users/${userId}`);
  }
};

export default userService;
