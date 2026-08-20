import apiClient from "./apiClient";

const authService = {
  /**
   * Gọi API Login
   * @param {Object} data 
   * @example data = { username: "admin", password: "123" }
   */
  login: (data) => {
    return apiClient.post("/auth/login", data);
  },

  /**
   * Gọi API Refresh Token
   */
  refreshToken: (token) => {
    return apiClient.post(`/auth/refresh?token=${token}`);
  },

  /**
   * Lưu Token và thông tin User vào LocalStorage
   */
  setSession: (authData) => {
    let token = null;
    if (authData) {
      if (authData.data && authData.data.token) {
        token = authData.data.token;
      } else if (authData.token) {
        token = authData.token;
      } else if (typeof authData === "string") {
        token = authData;
      }
    }

    if (!token) {
      console.error("Không tìm thấy token trong phản hồi đăng nhập");
      return;
    }

    localStorage.setItem("accessToken", token);
    
    // Giải mã JWT để lấy thông tin user và roles
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      
      localStorage.setItem("user", JSON.stringify({
        id: payload.userId || payload.sub,
        username: payload.upn || "",
        email: payload.email || "",
        fullName: payload.fullName || "",
        roles: payload.groups || []
      }));
    } catch (e) {
      console.error("Lỗi khi giải mã JWT token:", e);
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Xóa thông tin đăng nhập (Logout)
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  /**
   * Kiểm tra xem user có quyền ADMIN không
   */
  isAdmin: () => {
    const user = authService.getUser();
    return user && user.roles && user.roles.includes("ADMIN");
  }
};

export default authService;
