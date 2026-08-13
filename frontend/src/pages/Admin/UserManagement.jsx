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
      setUsers(res || []);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Quản lý Khách hàng (Customers)</h2>
        <button onClick={handleOpenCreateModal} className="btn-add-product">
          <FaPlus /> Thêm Khách hàng
        </button>
      </div>

      {/* Search and Stats Grid */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ flex: 1, minWidth: "250px", display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px" }}>
          <FaSearch style={{ color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên đăng nhập, email, họ tên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", width: "100%", color: "var(--text-primary)" }}
          />
        </div>
        <div style={{ fontWeight: "500", fontSize: "14px", color: "var(--text-muted)" }}>
          Tổng số khách hàng: <span style={{ color: "var(--primary)", fontWeight: "600" }}>{users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Đang tải danh sách khách hàng...
        </div>
      ) : (
        <div className="product-table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                      <FaUser style={{ color: "var(--primary)", fontSize: "0.9rem" }} />
                      {user.username}
                    </div>
                  </td>
                  <td>{user.fullName}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                      <FaEnvelope style={{ fontSize: "0.85rem" }} />
                      {user.email || "(Chưa cấu hình)"}
                    </div>
                  </td>
                  <td>
                    {user.roles && user.roles.map((role) => {
                      const isAdm = role === "ADMIN";
                      return (
                        <span 
                          key={role} 
                          className="status-badge" 
                          style={{ 
                            background: isAdm ? "rgba(224, 86, 253, 0.15)" : "rgba(74, 105, 255, 0.15)",
                            color: isAdm ? "var(--accent-pink)" : "var(--primary)",
                            marginRight: "4px"
                          }}
                        >
                          {role}
                        </span>
                      );
                    })}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button 
                        onClick={() => handleOpenEditModal(user)} 
                        className="btn-action edit" 
                        title="Sửa thông tin"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="btn-action delete" 
                        title="Xóa khách hàng"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
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
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>{editingId ? "Cập nhật Thông tin" : "Tạo Tài khoản Khách hàng"}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input 
                  type="text" 
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Nhập tên tài khoản"
                  required
                />
              </div>

              <div className="form-group">
                <label>Họ và tên *</label>
                <input 
                  type="text" 
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ Email *</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>{editingId ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu *"}</label>
                <input 
                  type="password" 
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required={!editingId}
                />
              </div>

              <div className="form-group">
                <label>{editingId ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu *"}</label>
                <input 
                  type="password" 
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu"
                  required={!!form.password}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-modal-cancel"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-modal-save"
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
