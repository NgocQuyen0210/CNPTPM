import apiClient from "./apiClient";

/**
 * Service xử lý AI Chatbot Tư Vấn Mua Sắm (gọi qua Backend Microservice)
 */
class AIService {
  /**
   * Lưu hoặc lấy API Key của Gemini từ LocalStorage
   */
  getApiKey() {
    return localStorage.getItem("gemini_api_key") || "";
  }

  setApiKey(key) {
    if (key) {
      localStorage.setItem("gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  }

  /**
   * Xử lý tin nhắn của khách hàng bằng cách gọi API Backend
   * @param {string} userMessage - Lời nhắn của người dùng
   * @param {Array} chatHistory - Lịch sử hội thoại cũ
   */
  async consult(userMessage, chatHistory = []) {
    try {
      // Map lại lịch sử hội thoại dạng đơn giản để gửi lên backend
      const history = chatHistory
        .filter(msg => msg.sender === "user" || msg.sender === "bot")
        .slice(-6)
        .map(msg => ({
          sender: msg.sender === "user" ? "user" : "bot",
          text: msg.text
        }));

      const apiKey = this.getApiKey();

      // Gọi API Gateway (/api/v1/ai/consult)
      // apiClient tự động unwrap ApiResponse trả về response.data.data trực tiếp
      const response = await apiClient.post("/ai/consult", {
        message: userMessage,
        apiKey: apiKey || null,
        history: history
      });

      return response;
    } catch (error) {
      console.error("Lỗi khi kết nối với dịch vụ AI Backend:", error);
      throw error;
    }
  }
}

export default new AIService();
