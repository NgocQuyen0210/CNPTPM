import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaTrash,
  FaCog,
  FaMinus,
  FaShoppingCart,
  FaExternalLinkAlt,
  FaLightbulb,
  FaMagic,
  FaCheck
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import aiService from "../../services/aiService";
import "./AIChatbot.css";

const INITIAL_WELCOME = {
  id: "welcome-1",
  sender: "bot",
  text: "Xin chào! 👋 Tôi là **Trợ lý AI Tư Vấn Đồ Điện Tử & Phụ Kiện**.\n\nShop chuyên cung cấp Smartphone, Laptop, Tablet, Tai nghe, Đồng hồ thông minh và Phụ kiện công nghệ chính hãng. Bạn đang tìm mua thiết bị nào hoặc mức ngân sách bao nhiêu?",
  products: [],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const QUICK_PROMPTS = [
  "📱 Điện thoại dưới 15 triệu",
  "💻 Laptop học tập & văn phòng",
  "🎮 Cấu hình chơi game mượt",
  "🎧 Tai nghe & Phụ kiện",
  "🍎 Dòng sản phẩm Apple"
];

function AIChatbot() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const messagesEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("ai_chat_messages");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [INITIAL_WELCOME];
  });

  const [addedIds, setAddedIds] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => aiService.getApiKey());
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  // Tự động lưu lịch sử chat vào LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_chat_messages", JSON.stringify(messages));
  }, [messages]);

  // Cuộn xuống cuối cùng khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || input.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      products: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const response = await aiService.consult(textToSend, messages);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.messageText,
        products: response.products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Lỗi AI Chatbot:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Xin lỗi quý khách, hệ thống đang gặp chút gián đoạn khi kết nối với AI. Bạn hãy thử lại sau ít phút nhé!",
        products: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?")) {
      setMessages([INITIAL_WELCOME]);
      localStorage.removeItem("ai_chat_messages");
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    aiService.setApiKey(apiKey);
    setSavedKeyMsg(true);
    setTimeout(() => {
      setSavedKeyMsg(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    try {
      const displayImage = product.featuredImage || product.image;
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: displayImage
      });
      setAddedIds(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (err) {
      console.error("Lỗi thêm giỏ từ Chatbot:", err);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/dashboard/product/${productId}`);
  };

  // Format văn bản tiếng Việt có bold **text**
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="ai-chatbot-wrapper">
      {/* 1. NÚT KÍCH HOẠT FLOATING CHATBOT */}
      {!isOpen && (
        <button
          className="ai-floating-trigger"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          title="Trợ lý AI Tư Vấn Mua Sắm"
        >
          <div className="ai-trigger-pulse"></div>
          <FaRobot className="ai-trigger-icon" />
          <span className="ai-trigger-badge">AI</span>
          <span className="ai-trigger-tooltip">Tư vấn chọn mua cùng AI ⚡</span>
        </button>
      )}

      {/* 2. KHUNG CỬA SỔ CHATBOT */}
      {isOpen && (
        <div className={`ai-chat-window ${isMinimized ? "minimized" : ""}`}>
          {/* HEADER */}
          <div className="ai-chat-header">
            <div className="ai-header-title">
              <div className="ai-avatar">
                <FaRobot />
                <span className="ai-status-dot"></span>
              </div>
              <div>
                <h3>AI Tư Vấn Mua Sắm</h3>
                <span className="ai-subtitle">
                  {apiKey ? "Google Gemini 1.5 Powered ⚡" : "Smart Catalog Engine 💡"}
                </span>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                className="ai-icon-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt API Key Gemini"
              >
                <FaCog />
              </button>
              <button
                className="ai-icon-btn"
                onClick={handleClearHistory}
                title="Xóa lịch sử chat"
              >
                <FaTrash />
              </button>
              <button
                className="ai-icon-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Phóng to" : "Thu nhỏ"}
              >
                <FaMinus />
              </button>
              <button
                className="ai-icon-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* MODAL CÀI ĐẶT API KEY */}
              {showSettings && (
                <div className="ai-settings-panel">
                  <div className="ai-settings-header">
                    <h4><FaCog /> Cài đặt AI Model</h4>
                    <button onClick={() => setShowSettings(false)}><FaTimes /></button>
                  </div>
                  <p className="ai-settings-desc">
                    Tùy chọn nhập Google Gemini API Key của bạn để trải nghiệm tính năng trả lời thông minh sinh động nhất.
                  </p>
                  <form onSubmit={handleSaveApiKey}>
                    <input
                      type="password"
                      placeholder="Dán Gemini API Key tại đây..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="ai-key-input"
                    />
                    <div className="ai-settings-buttons">
                      <button type="submit" className="ai-save-btn">
                        {savedKeyMsg ? "✓ Đã lưu Key!" : "Lưu Cài Đặt"}
                      </button>
                      {apiKey && (
                        <button
                          type="button"
                          className="ai-remove-btn"
                          onClick={() => {
                            setApiKey("");
                            aiService.setApiKey("");
                          }}
                        >
                          Xóa Key
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* NỘI DUNG CUỘC HỘI THOẠI */}
              <div className="ai-chat-body">
                {messages.map((msg) => (
                  <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
                    {msg.sender === "bot" && (
                      <div className="ai-msg-avatar">
                        <FaRobot />
                      </div>
                    )}
                    <div className="ai-msg-content">
                      <div className="ai-msg-bubble">
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* DANH SÁCH SẢN PHẨM ĐƯỢC AI GỢI Ý */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="ai-products-recommend-grid">
                          <p className="ai-recommend-title">
                            <FaLightbulb /> Sản phẩm được đề xuất riêng cho bạn:
                          </p>
                          <div className="ai-cards-container">
                            {msg.products.map((p) => {
                              const img = p.featuredImage || p.image || "https://via.placeholder.com/150";
                              const priceFormatted = Number(p.price || 0).toLocaleString("vi-VN");
                              const isAdded = addedIds[p.id];

                              return (
                                <div
                                  key={p.id}
                                  className="ai-product-card"
                                  onClick={() => handleViewProduct(p.id)}
                                >
                                  <div className="ai-product-img-wrapper">
                                    <img src={img} alt={p.name} />
                                    {p.brand && <span className="ai-card-brand">{p.brand}</span>}
                                  </div>

                                  <div className="ai-product-details">
                                    <h5 className="ai-card-name" title={p.name}>{p.name}</h5>
                                    <p className="ai-card-price">{priceFormatted}đ</p>

                                    <div className="ai-card-actions">
                                      <button
                                        className="ai-btn-view"
                                        onClick={(e) => { e.stopPropagation(); handleViewProduct(p.id); }}
                                      >
                                        Chi tiết <FaExternalLinkAlt />
                                      </button>
                                      <button
                                        className={`ai-btn-cart ${isAdded ? "added" : ""}`}
                                        onClick={(e) => handleAddToCart(p, e)}
                                      >
                                        {isAdded ? (
                                          <>✓ Đã thêm</>
                                        ) : (
                                          <><FaShoppingCart /> Giỏ hàng</>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <span className="ai-msg-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {loading && (
                  <div className="ai-message-row bot">
                    <div className="ai-msg-avatar">
                      <FaRobot />
                    </div>
                    <div className="ai-msg-content">
                      <div className="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* GỢI Ý NHANH (QUICK CHIPS) */}
              <div className="ai-quick-suggestions">
                {QUICK_PROMPTS.map((promptText, index) => (
                  <button
                    key={index}
                    className="ai-quick-chip"
                    onClick={() => handleSend(promptText)}
                    disabled={loading}
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* THANH NHẬP TIN NHẮN */}
              <div className="ai-chat-input-area">
                <input
                  type="text"
                  placeholder="Nhập nhu cầu mua sắm của bạn (VD: Tìm laptop dưới 15tr)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  title="Gửi tin nhắn"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AIChatbot;
