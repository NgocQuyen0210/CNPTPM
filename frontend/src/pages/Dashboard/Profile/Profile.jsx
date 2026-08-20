import React, { useState, useEffect } from "react";
import authService from "../../../services/authService";
import apiClient from "../../../services/apiClient";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./Profile.css";

function Profile() {
  const currentUser = authService.getUser();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setErrorMsg("Không tìm thấy thông tin phiên đăng nhập.");
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/users/${currentUser.id}`);
      if (data) {
        setForm({
          username: data.username || "",
          email: data.email || "",
          fullName: data.fullName || "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin người dùng:", err);
      setErrorMsg("Không thể tải thông tin tài khoản của bạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user types
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.fullName.trim()) {
      setErrorMsg("Họ và tên không được để trống.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMsg("Email không được để trống.");
      return;
    }

    // If changing password, validate matches and size
    if (form.password) {
      if (form.password.length < 6) {
        setErrorMsg("Mật khẩu mới phải từ 6 ký tự trở lên.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrorMsg("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload = {
        username: form.username,
        email: form.email,
        fullName: form.fullName,
        password: form.password || "",
        confirmPassword: form.confirmPassword || ""
      };

      const updatedUser = await apiClient.put(`/users/${currentUser.id}`, payload);
      
      if (updatedUser) {
        // Cập nhật thông tin trong LocalStorage
        const updatedLocalUser = {
          ...currentUser,
          email: updatedUser.email,
          fullName: updatedUser.fullName
        };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
        
        // Phát sự kiện cập nhật để header đồng bộ ngay lập tức
        window.dispatchEvent(new Event("user-updated"));

        setSuccessMsg("Cập nhật thông tin tài khoản thành công!");
        setForm(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
      }
    } catch (err) {
      console.error("Lỗi cập nhật người dùng:", err);
      const msg = err.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.";
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-glass-card loading-box">
          <div className="spinner"></div>
          <p>Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-glass-card">
        <div className="profile-header">
          <h2>Thiết Lập Tài Khoản</h2>
          <p>Cập nhật thông tin cá nhân và mật khẩu của bạn.</p>
        </div>

        {successMsg && (
          <div className="alert-box alert-success">
            <FaCheckCircle className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert-box alert-error">
            <FaExclamationCircle className="alert-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="profile-form-group">
              <label>Tên đăng nhập (Username)</label>
              <div className="input-with-icon disabled">
                <FaUser className="input-icon" />
                <input 
                  type="text" 
                  value={form.username} 
                  disabled 
                  title="Tên đăng nhập không thể thay đổi" 
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Họ và tên *</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input 
                  required
                  type="text" 
                  name="fullName"
                  placeholder="Nhập họ và tên của bạn" 
                  value={form.fullName}
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          </div>

          <div className="profile-form-group">
            <label>Địa chỉ Email *</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input 
                required
                type="email" 
                name="email"
                placeholder="VD: nguyenvana@gmail.com" 
                value={form.email}
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="password-section">
            <h4>Đổi mật khẩu (Để trống nếu không muốn thay đổi)</h4>
            
            <div className="form-row">
              <div className="profile-form-group">
                <label>Mật khẩu mới</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Tối thiểu 6 ký tự" 
                    value={form.password}
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Xác nhận mật khẩu mới</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới" 
                    value={form.confirmPassword}
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-form-actions">
            <button 
              type="submit" 
              className="btn-profile-submit"
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
