import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import supplierService from "../../services/supplierService";
import userService from "../../services/userService";
import "./AdminDashboard.css";

// React Icons
import { 
  FaBoxOpen, FaLayerGroup, FaTruck, FaUsers, 
  FaArrowRight, FaClock, FaChartBar, FaUserShield 
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    suppliers: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const prodRes = await productService.getProducts();
      const catRes = await categoryService.getAll();
      const supRes = await supplierService.getAll();
      const userRes = await userService.getUsers();

      setStats({
        products: prodRes ? prodRes.length : 0,
        categories: catRes ? catRes.length : 0,
        suppliers: supRes ? supRes.length : 0,
        users: userRes ? userRes.length : 0
      });
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get current date string
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Welcome Header */}
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <FaUserShield style={{ fontSize: "1.8rem" }} /> Tổng quan hệ thống
          </h1>
          <p>Chào mừng quay trở lại, Quản Trị Viên</p>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic" }}>{currentDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FaBoxOpen />
          </div>
          <div className="stat-info">
            <h3>Sản phẩm</h3>
            <p>{loading ? "..." : stats.products}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <FaLayerGroup />
          </div>
          <div className="stat-info">
            <h3>Danh mục</h3>
            <p>{loading ? "..." : stats.categories}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <FaTruck />
          </div>
          <div className="stat-info">
            <h3>Nhà cung cấp</h3>
            <p>{loading ? "..." : stats.suppliers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Thành viên</h3>
            <p>{loading ? "..." : stats.users}</p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="dashboard-grid">
        {/* Left Side: Charts & Activities */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Visual statistics simulation */}
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">
              <span><FaChartBar /> Tỷ trọng danh mục ngành hàng</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "normal" }}>Theo số lượng sản phẩm</span>
            </h3>
            
            <div className="chart-container">
              <div className="chart-bar-item">
                <div className="chart-bar-info">
                  <span>Điện thoại di động</span>
                  <span>45%</span>
                </div>
                <div className="chart-bar-wrapper">
                  <div className="chart-bar-fill purple" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div className="chart-bar-item">
                <div className="chart-bar-info">
                  <span>Máy tính & Laptop</span>
                  <span>30%</span>
                </div>
                <div className="chart-bar-wrapper">
                  <div className="chart-bar-fill blue" style={{ width: "30%" }}></div>
                </div>
              </div>

              <div className="chart-bar-item">
                <div className="chart-bar-info">
                  <span>Phụ kiện công nghệ</span>
                  <span>15%</span>
                </div>
                <div className="chart-bar-wrapper">
                  <div className="chart-bar-fill pink" style={{ width: "15%" }}></div>
                </div>
              </div>

              <div className="chart-bar-item">
                <div className="chart-bar-info">
                  <span>Các sản phẩm khác</span>
                  <span>10%</span>
                </div>
                <div className="chart-bar-wrapper">
                  <div className="chart-bar-fill green" style={{ width: "10%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* System logs / Activity */}
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">
              <span><FaClock /> Nhật ký hoạt động gần đây</span>
            </h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot purple"></div>
                <div className="activity-text">
                  <span style={{ color: "var(--text-primary)" }}>Khởi chạy hệ thống máy chủ Quarkus thành công</span>
                  <span className="activity-time">Vừa xong</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot blue"></div>
                <div className="activity-text">
                  <span style={{ color: "var(--text-primary)" }}>Đồng bộ hóa cơ sở dữ liệu MySQL và khóa ký Token JWT</span>
                  <span className="activity-time">5 phút trước</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div className="activity-text">
                  <span style={{ color: "var(--text-primary)" }}>Cập nhật sơ đồ bảo mật CORS chéo nguồn cho Frontend</span>
                  <span className="activity-time">10 phút trước</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Quick Shortcuts */}
        <div className="dashboard-card" style={{ height: "fit-content" }}>
          <h3 className="dashboard-card-title">Lối tắt tác vụ</h3>
          <div className="quick-list">
            
            <div className="quick-item" onClick={() => navigate("/admin/products")}>
              <div>
                <div className="quick-item-title">Quản lý Sản phẩm</div>
                <div className="quick-item-desc">Thêm sản phẩm, điều chỉnh giá, quản lý biến thể</div>
              </div>
              <FaArrowRight style={{ color: "var(--primary)" }} />
            </div>

            <div className="quick-item" onClick={() => navigate("/admin/categories")}>
              <div>
                <div className="quick-item-title">Quản lý Danh mục</div>
                <div className="quick-item-desc">Tạo mới, sửa đổi cơ cấu ngành hàng</div>
              </div>
              <FaArrowRight style={{ color: "var(--secondary)" }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
