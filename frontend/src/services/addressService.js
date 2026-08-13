import apiClient from "./apiClient";

/**
 * Service quản lý các lệnh gọi API liên quan đến Address
 * Lưu ý: Theo backend yêu cầu, đa số API của Address cần truyền Header "User-ID".
 */
const addressService = {
  /**
   * Lấy danh sách địa chỉ của User
   * @param {number|string} userId - ID của người dùng
   * @returns {Promise} Dữ liệu trả về từ server
   */
  getAddresses: (userId) => {
    return apiClient.get("/addresses", {
      headers: {
        "User-ID": userId,
      },
    });
  },

  /**
   * Tạo địa chỉ mới
   * @param {number|string} userId - ID của người dùng
   * @param {Object} data - Dữ liệu địa chỉ
   * @example
   * data = {
   *   "fullName": "Trương Văn Duy",
   *   "phoneNumber": "0987654321",
   *   "province": "Hà Nam",
   *   "district": "Bắc Từ Liêm",
   *   "ward": "Minh Khai",
   *   "detailAddress": "nhà xa xa chỗ gần í",
   *   "isDefault": true
   * }
   */
  createAddress: (userId, data) => {
    return apiClient.post("/addresses", data, {
      headers: {
        "User-ID": userId,
      },
    });
  },

  /**
   * Cập nhật địa chỉ
   * @param {number|string} userId - ID của người thực hiện update
   * @param {number|string} addressId - ID của địa chỉ cần update
   * @param {Object} data - Dữ liệu địa chỉ mới (giống DTO của create)
   */
  updateAddress: (userId, addressId, data) => {
    return apiClient.put(`/addresses/${addressId}`, data, {
      headers: {
        "User-ID": userId,
      },
    });
  },

  /**
   * Xóa địa chỉ
   * @param {number|string} userId - ID của người thực hiện xóa
   * @param {number|string} addressId - ID của địa chỉ cần xóa
   */
  deleteAddress: (userId, addressId) => {
    return apiClient.delete(`/addresses/${addressId}`, {
      headers: {
        "User-ID": userId,
      },
    });
  },

  /**
   * Đặt làm địa chỉ mặc định
   * @param {number|string} userId - ID của người dùng
   * @param {number|string} addressId - ID của địa chỉ muốn set mặc định
   */
  setDefaultAddress: (userId, addressId) => {
    // API endpoint được backend khai báo là PATCH /addresses/{id}/set-default
    return apiClient.patch(`/addresses/${addressId}/set-default`, null, {
      headers: {
        "User-ID": userId,
      },
    });
  },
};

export default addressService;
