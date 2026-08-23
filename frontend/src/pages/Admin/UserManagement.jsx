import React, { useState, useEffect } from "react";
import userService from "../../services/userService";

// React Icons
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaUser, FaEnvelope 
} from "react-icons/fa";
import "./ProductManagement.css"; // Reuse the premium modal, table, and stats styling

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", fullName: "", password: "", confirmPassword: "" });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      // Chỉ hiển thị các tài khoản không có vai trò ADMIN (chỉ hiện tài khoản USER)
      const customerUsers = (res || []).filter(
        (user) => !user.roles || !user.roles.includes("ADMIN")
      );
      setUsers(customerUsers);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({ username: "", email: "", fullName: "", password: "", confirmPassword: "" });
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      email: user.email || "",
      fullName: user.fullName || "",
      password: "", // Yêu cầu nhập mật khẩu để xác nhận/cập nhật
      confirmPassword: ""
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!form.username || !form.email || !form.fullName) {
      alert("Vui lòng điền đầy đủ Tên đăng nhập, Email và Họ tên!");
      return;
    }

    if (!editingId && (!form.password || !form.confirmPassword)) {
      alert("Vui lòng nhập mật khẩu cho tài khoản mới!");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Gửi thông tin cập nhật
        await userService.updateUser(editingId, form);
      } else {
        // Tạo tài khoản mới
        await userService.createUser(form);
      }
      setShowModal(false);
      setForm({ username: "", email: "", fullName: "", password: "", confirmPassword: "" });
      setEditingId(null);
      fetchUsers();
      alert(editingId ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản thành công!");
    } catch (error) {
      console.error("Lỗi lưu người dùng:", error);
      alert(error.response?.data?.message || "Lưu thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
        alert("Xóa người dùng thành công!");
      } catch (error) {
        console.error("Lỗi xóa người dùng:", error);
        alert(error.response?.data?.message || "Không thể xóa người dùng này.");
      }
    }
  };

  // Filter Users
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>
          Quản lý Khách hàng (Customers)
        </h2>
        <button onClick={handleOpenCreateModal} className="btn-add-product" style={{ padding: "12px 24px", fontSize: "15px" }}>
          <FaPlus /> Thêm Khách hàng
        </button>
      </div>

      {/* Search and Stats Bar */}
      <div className="filter-bar" style={{ padding: "18px 24px", marginBottom: "28px" }}>
        <div className="filter-search" style={{ flex: 1 }}>
          <FaSearch className="filter-search-icon" style={{ fontSize: "17px" }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên đăng nhập, email, họ tên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: "15px", padding: "14px 16px 14px 48px" }}
          />
        </div>
        <div style={{ fontWeight: "600", fontSize: "15px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", paddingRight: "10px" }}>
          Tổng số khách hàng: <span style={{ color: "var(--primary)", fontSize: "18px", fontWeight: "800" }}>{users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontSize: "16px" }}>
          Đang tải danh sách khách hàng...
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "80px", fontSize: "15px", padding: "18px 16px" }}>ID</th>
                <th style={{ textAlign: "left", fontSize: "15px", padding: "18px 16px" }}>Tên đăng nhập</th>
                <th style={{ textAlign: "left", fontSize: "15px", padding: "18px 16px" }}>Họ và tên</th>
                <th style={{ textAlign: "left", fontSize: "15px", padding: "18px 16px" }}>Email</th>
                <th style={{ width: "160px", fontSize: "15px", padding: "18px 16px" }}>Vai trò</th>
                <th style={{ width: "220px", textAlign: "center", fontSize: "15px", padding: "18px 16px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: "700", fontSize: "14.5px", padding: "18px 16px" }}>#{user.id}</td>
                  <td style={{ padding: "18px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>
                      <FaUser style={{ color: "var(--primary)", fontSize: "1.1rem" }} />
                      {user.username}
                    </div>
                  </td>
                  <td style={{ fontWeight: "600", fontSize: "15px", color: "var(--text-primary)", textAlign: "left", padding: "18px 16px" }}>
                    {user.fullName}
                  </td>
                  <td style={{ padding: "18px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)", fontSize: "14.5px", textAlign: "left" }}>
                      <FaEnvelope style={{ fontSize: "1rem", color: "var(--text-muted)" }} />
                      {user.email || "(Chưa cấu hình)"}
                    </div>
                  </td>
                  <td style={{ padding: "18px 16px" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      {user.roles && user.roles.map((role) => {
                        const isAdm = role === "ADMIN";
                        return (
                          <span 
                            key={role} 
                            className="badge" 
                            style={{ 
                              background: isAdm ? "rgba(8, 145, 178, 0.15)" : "rgba(13, 148, 136, 0.15)",
                              color: isAdm ? "var(--accent-pink)" : "var(--primary)",
                              border: isAdm ? "1px solid rgba(8, 145, 178, 0.25)" : "1px solid rgba(13, 148, 136, 0.25)",
                              fontSize: "12px",
                              padding: "6px 12px",
                              fontWeight: "700",
                              borderRadius: "20px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px"
                            }}
                          >
                            {role}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "18px 16px" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <button 
                        onClick={() => handleOpenEditModal(user)} 
                        className="btn-action-edit" 
                        title="Sửa thông tin"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13.5px" }}
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="btn-action-delete" 
                        title="Xóa khách hàng"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13.5px" }}
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)", fontSize: "15.5px" }}>
                    Không tìm thấy khách hàng nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "520px" }}>
            <div className="admin-modal-header">
              <h3>{editingId ? "Cập nhật Thông tin Khách hàng" : "Tạo Tài khoản Khách hàng"}</h3>
              <button onClick={() => setShowModal(false)} className="btn-modal-close">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: "1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Tên đăng nhập *</label>
                    <input 
                      type="text" 
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Nhập tên tài khoản"
                      required
                      style={{ padding: "11px 14px", fontSize: "14.5px" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Họ và tên *</label>
                    <input 
                      type="text" 
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                      style={{ padding: "11px 14px", fontSize: "14.5px" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Địa chỉ Email *</label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                      style={{ padding: "11px 14px", fontSize: "14.5px" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
                      {editingId ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu *"}
                    </label>
                    <input 
                      type="password" 
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      required={!editingId}
                      style={{ padding: "11px 14px", fontSize: "14.5px" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
                      {editingId ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu *"}
                    </label>
                    <input 
                      type="password" 
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu"
                      required={!!form.password}
                      style={{ padding: "11px 14px", fontSize: "14.5px" }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer" style={{ padding: "16px 20px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-action-delete"
                  style={{ padding: "10px 22px", fontSize: "14px" }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-add-product"
                  style={{ padding: "10px 26px", fontSize: "14px", boxShadow: "none" }}
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
