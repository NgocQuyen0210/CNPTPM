import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
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
              <p>nhom7@gmail.com</p>
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
            <button type="submit" className="btn-submit">
              Gửi Tin Nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
