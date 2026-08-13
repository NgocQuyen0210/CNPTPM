import axios from "axios";

// Khởi tạo một instance của Axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: "http://localhost:9000/api/v1", // Địa chỉ của Quarkus Backend
  timeout: 10000, // Timeout sau 10 giây nếu server không phản hồi
  headers: {
    "Content-Type": "application/json",
    // Nếu có token xác thực (JWT), bạn có thể cấu hình ở đây sau này
    // "Authorization": `Bearer ${localStorage.getItem('token')}`
  },
});

// Interceptor cho Request (xử lý trước khi gửi API đi)
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("accessToken");
    const isLoginRequest = config.url && config.url.includes("/auth/login");

    if (token && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response (xử lý khi nhận dữ liệu từ Backend về)
apiClient.interceptors.response.use(
  (response) => {
    // Nếu phản hồi có bọc trong ApiResponse (success & data) thì unwrap lấy data gốc
    if (response.data && typeof response.data === "object" && "success" in response.data && "data" in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response || error.message);
    if (error.response && error.response.status === 401) {
      // Nếu nhận phản hồi 401 Unauthorized và đang lưu token trong localStorage,
      // nghĩa là token không hợp lệ/đã bị sai khớp chữ ký sau khi restart database.
      if (localStorage.getItem("accessToken")) {
        console.warn("Phiên làm việc không hợp lệ (401), tự động xóa token và tải lại trang.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

