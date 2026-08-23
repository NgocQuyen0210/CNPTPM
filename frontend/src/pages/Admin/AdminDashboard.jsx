import React, { useState, useEffect } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import supplierService from "../../services/supplierService";
import userService from "../../services/userService";
import orderService from "../../services/orderService";
import "./AdminDashboard.css";

// React Icons
import { 
  FaBoxOpen, FaLayerGroup, FaTruck, FaUsers, 
  FaClock, FaChartBar,
  FaMoneyBillWave, FaCalendarAlt, FaCalendarCheck, FaShoppingBag,
  FaFileExcel, FaDownload, FaUserShield, FaArrowRight
} from "react-icons/fa";

function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    suppliers: 0,
    users: 0
  });
  const [businessStats, setBusinessStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    productsSold: 0
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    
    const fetchProducts = async () => {
      try {
        const res = await productService.getProducts();
        return res ? res.length : 0;
      } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
        return 0;
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        return res ? res.length : 0;
      } catch (err) {
        console.error("Lỗi lấy danh sách danh mục:", err);
        return 0;
      }
    };

    const fetchSuppliers = async () => {
      try {
        const res = await supplierService.getAll();
        return res ? res.length : 0;
      } catch (err) {
        console.error("Lỗi lấy danh sách nhà cung cấp:", err);
        return 0;
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        return res ? res.length : 0;
      } catch (err) {
        console.error("Lỗi lấy danh sách thành viên:", err);
        return 0;
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await orderService.getAllOrdersForAdmin();
        return res || [];
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng cho admin:", err);
        return [];
      }
    };

    try {
      const [prodCount, catCount, supCount, userCount, orders] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSuppliers(),
        fetchUsers(),
        fetchOrders()
      ]);

      setStats({
        products: prodCount,
        categories: catCount,
        suppliers: supCount,
        users: userCount
      });

      const now = new Date();
      const todayStr = now.toDateString();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let todayRevenue = 0;
      let monthRevenue = 0;
      let yearRevenue = 0;
      let productsSold = 0;

      // Initialize last 6 months
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last6Months.push({
          month: d.getMonth(),
          year: d.getFullYear(),
          name: d.toLocaleDateString("vi-VN", { month: "short" }), // e.g., "Thg 8"
          revenue: 0
        });
      }

      orders.forEach(order => {
        if (order.status === "CANCELLED" || order.status === "RETURNED") {
          return;
        }

        const orderDate = new Date(order.createdAt);
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth();
        
        // Year Stats
        if (orderYear === currentYear) {
          yearRevenue += order.totalPrice || 0;
          
          // Month Stats
          if (orderMonth === currentMonth) {
            monthRevenue += order.totalPrice || 0;
          }
          
          // Today Stats
          if (orderDate.toDateString() === todayStr) {
            todayRevenue += order.totalPrice || 0;
          }
        }

        // Count in monthly data if it belongs to the last 6 months
        const monthItem = last6Months.find(m => m.month === orderMonth && m.year === orderYear);
        if (monthItem) {
          monthItem.revenue += order.totalPrice || 0;
        }

        // Count sold items
        if (order.orderItems) {
          order.orderItems.forEach(item => {
            productsSold += item.quantity || 0;
          });
        }
      });

      setBusinessStats({
        todayRevenue,
        monthRevenue,
        yearRevenue,
        productsSold
      });
      setMonthlyRevenueData(last6Months);

    } catch (error) {
      console.error("Lỗi xử lý dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportRevenue = async () => {
    try {
      let orders = [];
      try {
        const ordersRes = await orderService.getAllOrdersForAdmin();
        orders = ordersRes || [];
      } catch (err) {
        console.error("Lỗi lấy đơn hàng để xuất báo cáo:", err);
        alert("Không thể lấy dữ liệu đơn hàng.");
        return;
      }

      const activeOrders = orders.filter(o => o.status !== "CANCELLED" && o.status !== "RETURNED");

      let csvContent = "\ufeff"; // UTF-8 BOM for Vietnamese character encoding in Excel
      
      csvContent += "BÁO CÁO DOANH THU & ĐƠN HÀNG CHI TIẾT\n";
      csvContent += `Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}\n`;
      csvContent += `Tổng số đơn hàng active: ${activeOrders.length}\n`;
      csvContent += `Tổng doanh thu lũy kế: ${activeOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toLocaleString("vi-VN")}đ\n\n`;

      csvContent += "I. THỐNG KÊ DOANH THU THEO THÁNG\n";
      csvContent += "Tháng/Năm,Số đơn hàng,Doanh thu (VND)\n";
      
      const monthlySummary = {};
      activeOrders.forEach(o => {
        const d = new Date(o.createdAt);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        if (!monthlySummary[key]) {
          monthlySummary[key] = { count: 0, total: 0 };
        }
        monthlySummary[key].count += 1;
        monthlySummary[key].total += o.totalPrice || 0;
      });

      Object.keys(monthlySummary).sort((a, b) => {
        const [mA, yA] = a.split("/").map(Number);
        const [mB, yB] = b.split("/").map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      }).forEach(key => {
        csvContent += `"${key}",${monthlySummary[key].count},${monthlySummary[key].total}\n`;
      });
      
      csvContent += "\n";

      csvContent += "II. DANH SÁCH ĐƠN HÀNG CHI TIẾT\n";
      csvContent += "Mã đơn hàng,Khách hàng,Số điện thoại,Địa chỉ nhận hàng,Thanh toán,Trạng thái đơn,Ngày đặt,Tổng giá trị (VND)\n";
      
      activeOrders.forEach(o => {
        const dateStr = new Date(o.createdAt).toLocaleString("vi-VN");
        const address = `"${o.detailAddress || ""}, ${o.ward || ""}, ${o.district || ""}, ${o.province || ""}"`;
        csvContent += `#${o.id},"${o.shippingFullName || ""}",'${o.shippingPhone || ""},${address},"${o.paymentMethod || ""}","${o.status || ""}","${dateStr}",${o.totalPrice || 0}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Bao_cao_Doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi xuất file Excel:", error);
      alert("Lỗi xuất báo cáo.");
    }
  };

  const handleExportLowStock = async () => {
    try {
      let products = [];
      try {
        const prodRes = await productService.getProducts();
        products = prodRes || [];
      } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
        alert("Không thể lấy dữ liệu sản phẩm.");
        return;
      }

      const inventoryList = [];
      products.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach(v => {
            inventoryList.push({
              productId: p.id,
              productName: p.name,
              brand: p.brand || "—",
              category: p.categoryName || (p.category ? p.category.name : "Chưa phân loại"),
              variantId: v.id,
              variantName: v.name,
              sku: v.sku || "—",
              price: v.price || p.price || 0,
              stock: v.stockQuantity || 0
            });
          });
        } else {
          inventoryList.push({
            productId: p.id,
            productName: p.name,
            brand: p.brand || "—",
            category: p.categoryName || (p.category ? p.category.name : "Chưa phân loại"),
            variantId: "—",
            variantName: "—",
            sku: "—",
            price: p.price || 0,
            stock: p.stockQuantity || 0
          });
        }
      });

      inventoryList.sort((a, b) => a.stock - b.stock);

      let csvContent = "\ufeff"; // UTF-8 BOM
      
      csvContent += "BÁO CÁO THỐNG KÊ TỒN KHO CHI TIẾT\n";
      csvContent += `Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}\n`;
      csvContent += `Tổng số biến thể quản lý: ${inventoryList.length}\n`;
      csvContent += `Số biến thể sắp hết hàng (<15 sản phẩm): ${inventoryList.filter(i => i.stock < 15).length}\n\n`;

      csvContent += "Danh sách chi tiết tồn kho (Sắp xếp theo Tồn kho tăng dần):\n";
      csvContent += "Mã SP,Tên sản phẩm,Thương hiệu,Danh mục,Mã cấu hình,Tên cấu hình,Mã SKU,Giá bán (VND),Tồn kho hiện tại,Tình trạng\n";

      inventoryList.forEach(i => {
        let status = "Đủ hàng";
        if (i.stock === 0) status = "Hết hàng";
        else if (i.stock < 15) status = "Sắp hết hàng";
        
        csvContent += `#${i.productId},"${i.productName}","${i.brand}","${i.category}","${i.variantId}","${i.variantName}","${i.sku}",${i.price},${i.stock},"${status}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Bao_cao_Ton_kho_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi xuất báo cáo tồn kho:", error);
      alert("Lỗi xuất báo cáo tồn kho.");
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

      {/* Business Stats Section */}
      <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
        <FaChartBar style={{ color: "var(--primary)" }} /> Hiệu suất kinh doanh
      </h3>
      <div className="stats-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-icon green">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>Doanh thu hôm nay</h3>
            <p style={{ color: "var(--accent-green)", fontSize: "20px", fontWeight: "800" }}>
              {loading ? "..." : businessStats.todayRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>Doanh thu tháng này</h3>
            <p style={{ color: "var(--secondary)", fontSize: "20px", fontWeight: "800" }}>
              {loading ? "..." : businessStats.monthRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FaCalendarCheck />
          </div>
          <div className="stat-info">
            <h3>Doanh thu năm nay</h3>
            <p style={{ color: "var(--primary)", fontSize: "20px", fontWeight: "800" }}>
              {loading ? "..." : businessStats.yearRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <FaShoppingBag />
          </div>
          <div className="stat-info">
            <h3>Sản phẩm bán ra</h3>
            <p style={{ color: "var(--accent-pink)", fontSize: "20px", fontWeight: "800" }}>
              {loading ? "..." : businessStats.productsSold} sp
            </p>
          </div>
        </div>
      </div>

      {/* System Resources Section */}
      <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
        <FaBoxOpen style={{ color: "var(--secondary)" }} /> Quản lý tài nguyên
      </h3>
      <div className="stats-grid" style={{ marginBottom: "32px" }}>
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
          
          {/* Custom Revenue Bar Chart */}
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">
              <span><FaChartBar style={{ color: "var(--primary)" }} /> Xu hướng doanh thu</span>
              <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "normal" }}>6 tháng gần nhất (VND)</span>
            </h3>

            <div className="revenue-chart-wrapper">
              <div className="revenue-chart-content">
                {monthlyRevenueData.map((data, index) => {
                  const maxRevenue = Math.max(...monthlyRevenueData.map(m => m.revenue), 1000000);
                  const heightPercent = (data.revenue / maxRevenue) * 82;
                  return (
                    <div key={index} className="revenue-chart-column">
                      <div className="revenue-chart-bar-container">
                        <div 
                          className="revenue-chart-bar" 
                          style={{ height: `${Math.max(heightPercent, 3)}%` }}
                        >
                          <div className="revenue-chart-tooltip">
                            <span className="tooltip-month">{data.name} / {data.year}</span>
                            <span className="tooltip-value">{data.revenue.toLocaleString("vi-VN")}đ</span>
                          </div>
                        </div>
                      </div>
                      <div className="revenue-chart-label">{data.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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

            <div className="quick-item" onClick={handleExportRevenue} style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
              <div>
                <div className="quick-item-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaFileExcel style={{ color: "var(--accent-green)" }} /> Xuất báo cáo doanh thu
                </div>
                <div className="quick-item-desc">Tải file Excel doanh thu theo tháng và chi tiết đơn hàng</div>
              </div>
              <FaDownload style={{ color: "var(--accent-green)", fontSize: "14px" }} />
            </div>

            <div className="quick-item" onClick={handleExportLowStock} style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
              <div>
                <div className="quick-item-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaFileExcel style={{ color: "#ef4444" }} /> Báo cáo tồn kho chi tiết
                </div>
                <div className="quick-item-desc">Tải danh sách chi tiết các biến thể sản phẩm theo lượng kho</div>
              </div>
              <FaDownload style={{ color: "#ef4444", fontSize: "14px" }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
