import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaChartLine, FaFolder, FaBoxOpen, FaSignOutAlt, FaUserShield, FaUsers, FaEnvelope, FaShoppingBag } from "react-icons/fa";
import authService from "../services/authService";
import "./admin.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="admin-layout">
      {/* Admin Sidebar - Ghim cố định */}
      <div className="admin-sidebar">
        <div>
          <h2>Admin Panel</h2>
          <ul className="admin-menu">
            <li className={isActive("/admin/dashboard")} onClick={() => navigate("/admin/dashboard")}>
              <FaChartLine /> Dashboard
            </li>
            <li className={isActive("/admin/categories")} onClick={() => navigate("/admin/categories")}>
              <FaFolder /> Quản lý Danh mục
            </li>
            <li className={isActive("/admin/products")} onClick={() => navigate("/admin/products")}>
              <FaBoxOpen /> Quản lý Sản phẩm
            </li>
            <li className={isActive("/admin/users")} onClick={() => navigate("/admin/users")}>
              <FaUsers /> Quản lý Khách hàng
            </li>
            <li className={isActive("/admin/orders")} onClick={() => navigate("/admin/orders")}>
              <FaShoppingBag /> Quản lý Đơn hàng
            </li>
            <li className={isActive("/admin/contacts")} onClick={() => navigate("/admin/contacts")}>
              <FaEnvelope /> Hỗ trợ & Liên hệ
            </li>
          </ul>
        </div>

        {/* Khối User & Nút Đăng xuất luôn được GHIM ở đáy Sidebar */}
        <div className="admin-sidebar-bottom">
          <div className="admin-user-info">
            <div className="admin-avatar-icon">
              <FaUserShield />
            </div>
            <div className="admin-user-details">
              <span className="admin-username">{currentUser?.username || "Admin"}</span>
              <span className="admin-role-badge">Quản trị viên</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-admin-logout" title="Đăng xuất khỏi hệ thống">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
