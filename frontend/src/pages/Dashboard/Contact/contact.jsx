import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaHistory, FaClock } from 'react-icons/fa';
import contactService from '../../../services/contactService';
import authService from '../../../services/authService';
import './contact.css';

function Contact() {
  const user = authService.getUser();

  const [formData, setFormData] = useState({
    name: user ? user.fullName || '' : '',
    email: user ? user.email || '' : '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      fetchHistory();
    }
  }, [user?.email]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const all = await contactService.getAllContacts();
      // Filter contacts matching this customer's email
      const filtered = all.filter(
        c => c.email && c.email.toLowerCase() === user.email.toLowerCase()
      );
      setMyMessages(filtered);
    } catch (err) {
      console.error("Lỗi lấy lịch sử phản hồi:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.sendContact(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setFormData({
        name: user ? user.fullName || '' : '',
        email: user ? user.email || '' : '',
        subject: '',
        message: ''
      });
      if (user && user.email) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn liên hệ:", err);
      alert("Không thể gửi tin nhắn liên hệ. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-hero">
        <h1>Liên Hệ Với Chúng Tôi</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc, mọi nơi.</p>
      </div>

      <div className="contact-container">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>Thông Tin Liên Hệ</h2>
          <p>
            Đừng ngần ngại liên hệ nếu bạn có bất kỳ câu hỏi nào về sản phẩm hoặc dịch vụ của chúng tôi. 
            Đội ngũ hỗ trợ của chúng tôi sẽ phản hồi bạn sớm nhất có thể.
          </p>

          <div className="info-item">
            <div className="icon-wrapper">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3>Địa chỉ</h3>
              <p>Đại học Công Nghiệp Hà Nội, Minh Khai, Bắc Từ Liêm, Hà Nội</p>
            </div>
          </div>

          <div className="info-item">
            <div className="icon-wrapper">
              <FaPhoneAlt />
            </div>
            <div>
              <h3>Điện thoại</h3>
              <p>+84 123 456 789</p>
            </div>
          </div>

          <div className="info-item">
            <div className="icon-wrapper">
              <FaEnvelope />
            </div>
            <div>
              <h3>Email</h3>
              <p>ngocquyen0210@gmail.com</p>
            </div>
          </div>

          <div className="social-links">
            <a href="#" className="social-icon"><FaFacebook /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <h2>Gửi Tin Nhắn</h2>
          {submitted && <div className="success-msg">Cảm ơn bạn! Tin nhắn đã được gửi thành công.</div>}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Nhập họ tên của bạn" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Nhập email của bạn" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Chủ đề</label>
              <input 
                type="text" 
                name="subject" 
                placeholder="Chủ đề bạn muốn hỏi" 
                value={formData.subject}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea 
                name="message" 
                rows="5" 
                placeholder="Nhập nội dung tin nhắn..." 
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
            </button>
          </form>
        </div>
      </div>

      {/* Contact History & Admin Replies Section */}
      {user ? (
        <div className="contact-history-section">
          <div className="history-header">
            <h2>
              <FaHistory style={{ marginRight: '8px', color: 'var(--primary)' }} />
              Lịch sử gửi liên hệ & Phản hồi từ Admin
            </h2>
            <p>Danh sách các câu hỏi bạn đã gửi và phản hồi chính thức từ ban quản trị cửa hàng.</p>
          </div>

          {loadingHistory ? (
            <div className="history-loading">Đang tải lịch sử liên hệ...</div>
          ) : myMessages.length === 0 ? (
            <div className="history-empty">
              Bạn chưa gửi câu hỏi hay yêu cầu hỗ trợ nào.
            </div>
          ) : (
            <div className="history-list">
              {myMessages.map((msg) => (
                <div key={msg.id} className="history-item-card">
                  <div className="history-item-header">
                    <div className="subject-box">
                      <span className="subject-title">{msg.subject}</span>
                      <span className="message-date">{msg.createdAt}</span>
                    </div>
                    <span className={`status-badge ${msg.status.toLowerCase()}`}>
                      {msg.status === 'PENDING' ? 'Chờ phản hồi' : 'Đã phản hồi'}
                    </span>
                  </div>

                  <div className="customer-question-box">
                    <div className="box-label">Câu hỏi của bạn:</div>
                    <p>{msg.message}</p>
                  </div>

                  {msg.replies && msg.replies.length > 0 ? (
                    <div className="admin-replies-box">
                      <div className="box-label">Phản hồi từ Admin:</div>
                      <div className="replies-thread">
                        {msg.replies.map((rep) => (
                          <div key={rep.id} className="reply-bubble-item">
                            <div className="reply-meta">Hệ thống phản hồi lúc: {rep.createdAt}</div>
                            <p className="reply-text-content">{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-reply-box">
                      <FaClock className="no-reply-icon" /> Đội ngũ hỗ trợ đang xem xét và sẽ trả lời bạn sớm nhất.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="contact-login-prompt">
          <p>💡 Hãy <strong>đăng nhập tài khoản</strong> để theo dõi lịch sử liên hệ và nhận câu trả lời phản hồi trực tiếp từ Admin tại đây.</p>
        </div>
      )}
    </div>
  );
}

export default Contact;
