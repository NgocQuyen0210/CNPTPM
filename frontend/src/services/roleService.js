import apiClient from "./apiClient";

/**
 * Service quản lý các lệnh gọi API liên quan đến Role (Quyền)
 */
const roleService = {
  /**
   * Lấy danh sách thông tin Role theo ID
   * @param {number|string} roleId
   */
  getRole: (roleId) => {
    return apiClient.get(`/roles/${roleId}`);
  },

  /**
   * Tạo Role mới
   * @param {Object} data - Dữ liệu Role
   * @example
   * data = {
   *   "name": "MANAGER",
   *   "description": "Quản lý cửa hàng, quản lý đơn hàng và sản phẩm"
   * }
   */
  createRole: (data) => {
    return apiClient.post("/roles", data);
  },
};

export default roleService;
