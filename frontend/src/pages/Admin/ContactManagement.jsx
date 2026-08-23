import React, { useState, useEffect } from "react";
import contactService from "../../services/contactService";
import { FaEnvelope, FaReply, FaCheckCircle, FaHourglassHalf, FaPaperPlane, FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import "./ContactManagement.css";

function ContactManagement() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, REPLIED
  const [selectedEmail, setSelectedEmail] = useState("");
  const [replyTexts, setReplyTexts] = useState({}); // { [messageId]: text }
  const [submitting, setSubmitting] = useState(false);
  
  // States for dropdown menu and edit reply mode
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

  useEffect(() => {
    fetchMessages();
    
    // Auto-close menu when clicking anywhere else
    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Grouping function
  const groupMessagesBySender = (allMessages) => {
    const groups = {};
    allMessages.forEach(msg => {
      const email = msg.email ? msg.email.toLowerCase().trim() : "unknown";
      if (!groups[email]) {
        groups[email] = {
          email: msg.email || "",
          name: msg.name || "Ẩn danh",
          messages: [],
          status: "REPLIED",
          latestCreatedAt: msg.createdAt,
        };
      }
      groups[email].messages.push(msg);
      if (msg.status === "PENDING") {
        groups[email].status = "PENDING";
      }
      if (new Date(msg.createdAt) > new Date(groups[email].latestCreatedAt)) {
        groups[email].latestCreatedAt = msg.createdAt;
        groups[email].name = msg.name || groups[email].name;
      }
    });

    Object.keys(groups).forEach(email => {
      // Sort messages within each group by createdAt (oldest first for chronological reading)
      groups[email].messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const hasPending = groups[email].messages.some(m => m.status === "PENDING");
      groups[email].status = hasPending ? "PENDING" : "REPLIED";
    });

    // Sort groups by latest activity (newest group first)
    return Object.values(groups).sort((a, b) => new Date(b.latestCreatedAt) - new Date(a.latestCreatedAt));
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await contactService.getAllContacts();
      const allMsgs = res || [];
      setMessages(allMsgs);
      
      const grouped = groupMessagesBySender(allMsgs);
      if (grouped.length > 0 && !selectedEmail) {
        setSelectedEmail(grouped[0].email);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tin nhắn:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSender = (group) => {
    setSelectedEmail(group.email);
    setReplyTexts({}); // Clear all reply texts
    setEditingReplyId(null); // Cancel edit
  };

  const handleSendReply = async (e, messageId) => {
    e.preventDefault();
    const text = replyTexts[messageId];
    if (!text || !text.trim()) return;

    setSubmitting(true);
    try {
      await contactService.replyContact(messageId, text);
      setReplyTexts(prev => ({ ...prev, [messageId]: "" })); // Clear specific input
      await fetchMessages(); // Refresh message list & detail view
    } catch (err) {
      console.error("Lỗi gửi phản hồi:", err);
      alert("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMenu = (e, replyId) => {
    e.stopPropagation(); // Prevent closing immediately due to window listener
    setActiveMenuId(activeMenuId === replyId ? null : replyId);
  };

  const handleStartEdit = (rep) => {
    setEditingReplyId(rep.id);
    setEditReplyText(rep.message);
    setActiveMenuId(null); // Close dropdown menu
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditReplyText("");
  };

  const handleSaveEdit = async (e, messageId, replyId) => {
    e.preventDefault();
    if (!editReplyText.trim()) return;

    try {
      await contactService.updateReply(messageId, replyId, editReplyText);
      setEditingReplyId(null);
      setEditReplyText("");
      await fetchMessages();
    } catch (err) {
      console.error("Lỗi cập nhật phản hồi:", err);
      alert("Không thể cập nhật phản hồi. Vui lòng thử lại.");
    }
  };

  const handleDeleteReply = async (messageId, replyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;

    try {
      await contactService.deleteReply(messageId, replyId);
      await fetchMessages(); // Refresh message list & detail view
    } catch (err) {
      console.error("Lỗi xóa phản hồi:", err);
      alert("Không thể xóa phản hồi. Vui lòng thử lại.");
    }
  };

  const groupedMessages = groupMessagesBySender(messages);

  const filteredGroups = groupedMessages.filter((group) => {
    if (filter === "ALL") return true;
    return group.status === filter;
  });

  const selectedGroup = groupedMessages.find(g => g.email.toLowerCase() === selectedEmail.toLowerCase()) || 
                        (groupedMessages.length > 0 ? groupedMessages[0] : null);

  return (
    <div className="contact-mgmt-container" style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div className="admin-content-header" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: "700", color: "var(--text-primary)" }}>
          <FaEnvelope style={{ color: "var(--primary)", marginRight: "8px" }} />
          Hỗ trợ & Liên hệ từ khách hàng
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Xem và phản hồi các tin nhắn góp ý, hỏi đáp từ phía người dùng hệ thống.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          Tất cả ({groupedMessages.length})
        </button>
        <button 
          className={`filter-tab ${filter === "PENDING" ? "active" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          <FaHourglassHalf style={{ marginRight: "6px" }} />
          Chưa trả lời ({groupedMessages.filter(g => g.status === "PENDING").length})
        </button>
        <button 
          className={`filter-tab ${filter === "REPLIED" ? "active" : ""}`}
          onClick={() => setFilter("REPLIED")}
        >
          <FaCheckCircle style={{ marginRight: "6px" }} />
          Đã phản hồi ({groupedMessages.filter(g => g.status === "REPLIED").length})
        </button>
      </div>

      <div className="contact-mgmt-layout">
        {/* Messages List */}
        <div className="messages-list-card">
          {loading ? (
            <div className="loading-placeholder">Đang tải danh sách tin nhắn...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="empty-placeholder">Không có khách hàng nào trong danh mục này.</div>
          ) : (
            <div className="messages-list">
              {filteredGroups.map((group) => {
                const isSelected = selectedGroup?.email.toLowerCase() === group.email.toLowerCase();
                const latestMsg = group.messages[group.messages.length - 1];
                return (
                  <div 
                    key={group.email} 
                    className={`message-item-card ${isSelected ? "selected" : ""} ${group.status === "PENDING" ? "pending" : ""}`}
                    onClick={() => handleSelectSender(group)}
                  >
                    <div className="msg-item-header">
                      <span className="msg-sender">
                        {group.name} {group.messages.length > 1 && `(${group.messages.length})`}
                      </span>
                      <span className={`msg-status-badge ${group.status.toLowerCase()}`}>
                        {group.status === "PENDING" ? "Chưa trả lời" : "Đã trả lời"}
                      </span>
                    </div>
                    <div className="msg-item-email" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-4px" }}>
                      {group.email}
                    </div>
                    {latestMsg && (
                      <>
                        <div className="msg-item-subject" style={{ marginTop: "4px", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {latestMsg.subject}
                        </div>
                        <div className="msg-item-text">
                          {latestMsg.message}
                        </div>
                        <div className="msg-item-date">
                          {latestMsg.createdAt}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Detail & Reply Form */}
        <div className="message-detail-card" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selectedGroup ? (
            <div className="message-detail-view" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div className="detail-header" style={{ flexShrink: 0 }}>
                <h3 style={{ margin: 0 }}>Lịch sử liên hệ của khách hàng</h3>
                <div className="detail-meta" style={{ marginTop: "12px" }}>
                  <div><strong>Khách hàng:</strong> {selectedGroup.name}</div>
                  <div><strong>Email:</strong> {selectedGroup.email}</div>
                  <div><strong>Số tin nhắn gửi:</strong> {selectedGroup.messages.length}</div>
                </div>
              </div>

              <div className="detail-body" style={{ flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column", gap: "24px" }}>
                {selectedGroup.messages.map((msg, index) => (
                  <div key={msg.id} className="message-thread-block" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", background: "rgba(255, 255, 255, 0.4)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="thread-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-color)", paddingBottom: "8px" }}>
                      <div>
                        <strong style={{ color: "var(--text-primary)" }}>Tin nhắn #{index + 1}: {msg.subject}</strong>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "8px" }}>({msg.createdAt})</span>
                      </div>
                      <span className={`msg-status-badge ${msg.status.toLowerCase()}`}>
                        {msg.status === "PENDING" ? "Chưa trả lời" : "Đã trả lời"}
                      </span>
                    </div>

                    <div className="user-message-bubble" style={{ alignSelf: "flex-start", width: "100%", maxWidth: "100%", margin: 0 }}>
                      <div className="bubble-label">Khách gửi:</div>
                      <p style={{ margin: 0 }}>{msg.message}</p>
                    </div>

                    {/* Replies to this message */}
                    {msg.replies && msg.replies.map((rep) => (
                      <div key={rep.id} className="admin-reply-bubble" style={{ alignSelf: "flex-end", width: "90%", margin: "4px 0 4px auto" }}>
                        {editingReplyId === rep.id ? (
                          /* Inline Edit Mode Form */
                          <form onSubmit={(e) => handleSaveEdit(e, msg.id, rep.id)} className="inline-edit-form">
                            <textarea
                              rows="3"
                              value={editReplyText}
                              onChange={(e) => setEditReplyText(e.target.value)}
                              required
                              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--primary)", resize: "none", marginBottom: "8px" }}
                            ></textarea>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button type="button" className="btn-cancel-edit" onClick={handleCancelEdit}>Hủy</button>
                              <button type="submit" className="btn-save-edit">Lưu</button>
                            </div>
                          </form>
                        ) : (
                          /* Standard Display Mode with Options Dropdown */
                          <>
                            <div className="bubble-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>Phản hồi lúc: {rep.createdAt}</span>
                              
                              <div className="reply-menu-container">
                                <button 
                                  type="button"
                                  className="btn-ellipsis-trigger" 
                                  onClick={(e) => toggleMenu(e, rep.id)}
                                  title="Tác vụ phản hồi"
                                >
                                  <FaEllipsisV />
                                </button>
                                
                                {activeMenuId === rep.id && (
                                  <div className="reply-dropdown-menu">
                                    <button type="button" onClick={() => handleStartEdit(rep)}>
                                      <FaEdit style={{ marginRight: "6px" }} /> Chỉnh sửa
                                    </button>
                                    <button type="button" onClick={() => handleDeleteReply(msg.id, rep.id)} className="delete-opt">
                                      <FaTrashAlt style={{ marginRight: "6px" }} /> Xóa bỏ
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p style={{ margin: 0 }}>{rep.message}</p>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Inline Reply Form for this specific message */}
                    <div className="detail-reply-form" style={{ marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <form onSubmit={(e) => handleSendReply(e, msg.id)} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                        <textarea
                          rows="2"
                          placeholder="Nhập nội dung phản hồi cho tin nhắn này..."
                          value={replyTexts[msg.id] || ""}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          required
                          style={{ flex: 1, margin: 0, padding: "8px 12px", borderRadius: "8px", minHeight: "44px", height: "44px", resize: "none" }}
                        ></textarea>
                        <button 
                          type="submit" 
                          className="btn-send-reply" 
                          disabled={submitting || !(replyTexts[msg.id] || "").trim()}
                          style={{ padding: "10px 18px", borderRadius: "8px", height: "44px", flexShrink: 0 }}
                        >
                          <FaPaperPlane style={{ marginRight: "6px" }} />
                          Gửi
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="detail-empty-placeholder">
              <FaReply style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "16px" }} />
              <p>Chọn một khách hàng từ danh sách để xem chi tiết và gửi câu trả lời phản hồi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactManagement;
