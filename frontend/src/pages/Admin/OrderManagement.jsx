import React, { useState, useEffect, useCallback } from "react";
import orderService from "../../services/orderService";
import { 
  FaSearch, FaShoppingBag, FaEye, FaTimes, FaFilter,
  FaClock, FaTruck, FaCheckCircle, FaBan, FaUndo,
  FaSyncAlt, FaBoxOpen, FaUser, FaPhone, FaMapMarkerAlt,
  FaStickyNote, FaCreditCard, FaCalendarAlt, FaTag
} from "react-icons/fa";
import "./ProductManagement.css";
import "./OrderManagement.css";

// ─── Trạng thái đơn hàng ──────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value: "ALL",        label: "Tất cả",          color: "#94a3b8",  bg: "rgba(148,163,184,0.12)",  icon: <FaShoppingBag /> },
  { value: "PENDING",    label: "Chờ xác nhận",     color: "#f59e0b",  bg: "rgba(245,158,11,0.12)",   icon: <FaClock /> },
  { value: "CONFIRMED",  label: "Đã xác nhận",      color: "#3b82f6",  bg: "rgba(59,130,246,0.12)",   icon: <FaCheckCircle /> },
  { value: "SHIPPING",   label: "Đang giao hàng",   color: "#8b5cf6",  bg: "rgba(139,92,246,0.12)",   icon: <FaTruck /> },
  { value: "DELIVERED",  label: "Đã giao hàng",     color: "#10b981",  bg: "rgba(16,185,129,0.12)",   icon: <FaCheckCircle /> },
  { value: "CANCELLED",  label: "Đã hủy",           color: "#ef4444",  bg: "rgba(239,68,68,0.12)",    icon: <FaBan /> },
  { value: "RETURNED",   label: "Hoàn trả",         color: "#f97316",  bg: "rgba(249,115,22,0.12)",   icon: <FaUndo /> },
];

// Các trạng thái admin được phép chuyển đổi
const ALLOWED_TRANSITIONS = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING:  ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED:  [],
};

const PAYMENT_LABELS = {
  COD:          "Thanh toán khi nhận hàng",
  ONLINE:       "Chuyển khoản online",
  BANK_TRANSFER:"Chuyển khoản ngân hàng",
  CREDIT_CARD:  "Thẻ tín dụng",
  MOMO:         "Ví MoMo",
  VNPAY:        "VNPay",
};

// ─── Helper: badge trạng thái ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}33`,
      borderRadius: "20px", padding: "4px 12px",
      fontSize: "12px", fontWeight: "700",
      whiteSpace: "nowrap"
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function OrderManagement() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId]   = useState(null);
  const [sortField, setSortField]     = useState("createdAt");
  const [sortDir, setSortDir]         = useState("desc");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrdersForAdmin();
      setOrders(res || []);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ─── Thống kê nhanh ──────────────────────────────────────────────────────────
  const stats = ORDER_STATUSES.filter(s => s.value !== "ALL").map(s => ({
    ...s,
    count: orders.filter(o => o.status === s.value).length
  }));

  // ─── Filter + Search + Sort ──────────────────────────────────────────────────
  const filtered = orders
    .filter(o => {
      if (o.paymentMethod === "VNPAY") return false;
      const matchStatus  = filterStatus === "ALL" || o.status === filterStatus;
      const matchPayment = filterPayment === "ALL" || o.paymentMethod === filterPayment;
      const q = searchTerm.toLowerCase();
      const matchSearch  = !q
        || String(o.id).includes(q)
        || (o.shippingFullName || "").toLowerCase().includes(q)
        || (o.shippingPhone    || "").toLowerCase().includes(q)
        || (o.province         || "").toLowerCase().includes(q);
      return matchStatus && matchPayment && matchSearch;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "createdAt") { va = new Date(va); vb = new Date(vb); }
      if (sortField === "totalPrice") { va = Number(va); vb = Number(vb); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // ─── Cập nhật trạng thái ─────────────────────────────────────────────────────
  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await orderService.updateStatus(id, newStatus);
      setOrders(prev =>
        prev.map(o => o.id === id ? { ...o, status: newStatus } : o)
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Toggle sort ─────────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, fontSize: "10px" }}>↕</span>;
    return <span style={{ fontSize: "11px", color: "var(--primary)" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
          <FaShoppingBag style={{ color: "var(--primary)" }} /> Quản lý Đơn hàng
        </h2>
        <button onClick={fetchOrders} className="btn-add-product" style={{ padding: "10px 20px", fontSize: "14px", gap: "8px" }}>
          <FaSyncAlt style={{ fontSize: "13px" }} /> Làm mới
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="order-stat-strip">
        {stats.map(s => (
          <div
            key={s.value}
            className={`order-stat-chip ${filterStatus === s.value ? "active" : ""}`}
            style={{ "--chip-color": s.color, "--chip-bg": s.bg }}
            onClick={() => setFilterStatus(prev => prev === s.value ? "ALL" : s.value)}
          >
            <span className="chip-icon">{s.icon}</span>
            <div className="chip-body">
              <span className="chip-count">{s.count}</span>
              <span className="chip-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="filter-bar" style={{ marginBottom: "24px" }}>
        <div className="filter-search" style={{ flex: 1 }}>
          <FaSearch className="filter-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên KH, SĐT, tỉnh/thành..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaFilter style={{ color: "var(--text-muted)", fontSize: "13px" }} />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ minWidth: "160px" }}
            >
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <select
            className="filter-select"
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            style={{ minWidth: "180px" }}
          >
            <option value="ALL">Tất cả phương thức TT</option>
            {Object.entries(PAYMENT_LABELS).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
          <span style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap" }}>
            Hiển thị: <strong style={{ color: "var(--primary)" }}>{filtered.length}</strong> / {orders.length} đơn
          </span>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="order-loading">
          <div className="order-loading-spinner" />
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table order-table">
            <thead>
              <tr>
                <th style={{ width: "80px", cursor: "pointer" }} onClick={() => toggleSort("id")}>
                  Mã ĐH <SortIcon field="id" />
                </th>
                <th style={{ textAlign: "left" }}>Khách hàng</th>
                <th style={{ textAlign: "left" }}>Địa chỉ giao hàng</th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("totalPrice")}>
                  Tổng tiền <SortIcon field="totalPrice" />
                </th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("createdAt")}>
                  Ngày đặt <SortIcon field="createdAt" />
                </th>
                <th style={{ width: "140px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: "800", color: "var(--primary)", fontSize: "15px" }}>
                    #{order.id}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14.5px" }}>
                      {order.shippingFullName}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                      {order.shippingPhone}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", maxWidth: "220px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>
                      {[order.detailAddress, order.ward, order.district, order.province].filter(Boolean).join(", ")}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "800", color: "var(--accent-green)", fontSize: "14.5px" }}>
                      {Number(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontWeight: "500" }}>
                      {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })
                      : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn-action-edit"
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px" }}
                        title="Xem chi tiết"
                      >
                        <FaEye /> Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontSize: "15px" }}>
                    <FaBoxOpen style={{ fontSize: "2.5rem", marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
                    Không có đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal ───────────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div className="admin-modal modal-large order-detail-modal">
            {/* Header */}
            <div className="admin-modal-header">
              <h3>
                <FaShoppingBag style={{ marginRight: "8px" }} />
                Chi tiết Đơn hàng #{selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="btn-modal-close">
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="admin-modal-body order-detail-body">

              {/* Trạng thái & Actions */}
              <div className="order-detail-section order-status-section">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Trạng thái hiện tại
                    </div>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  {ALLOWED_TRANSITIONS[selectedOrder.status]?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Chuyển trạng thái
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {ALLOWED_TRANSITIONS[selectedOrder.status].map(newStatus => {
                          const cfg = ORDER_STATUSES.find(s => s.value === newStatus);
                          return (
                            <button
                              key={newStatus}
                              onClick={() => handleUpdateStatus(selectedOrder.id, newStatus)}
                              disabled={updatingId === selectedOrder.id}
                              style={{
                                background: cfg?.bg, color: cfg?.color,
                                border: `1px solid ${cfg?.color}55`,
                                borderRadius: "8px", padding: "6px 14px",
                                fontSize: "13px", fontWeight: "700",
                                cursor: "pointer", display: "inline-flex",
                                alignItems: "center", gap: "6px",
                                transition: "all 0.2s",
                                opacity: updatingId === selectedOrder.id ? 0.6 : 1,
                              }}
                            >
                              {updatingId === selectedOrder.id ? <FaSyncAlt style={{ animation: "spin 1s linear infinite" }} /> : cfg?.icon}
                              {cfg?.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-detail-grid">
                {/* Thông tin khách hàng & giao hàng */}
                <div className="order-detail-section">
                  <h4 className="order-detail-section-title"><FaUser /> Thông tin giao hàng</h4>
                  <div className="order-detail-info-rows">
                    <div className="order-detail-row">
                      <FaUser className="order-detail-row-icon" />
                      <div>
                        <div className="row-label">Người nhận</div>
                        <div className="row-value">{selectedOrder.shippingFullName}</div>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <FaPhone className="order-detail-row-icon" />
                      <div>
                        <div className="row-label">Số điện thoại</div>
                        <div className="row-value">{selectedOrder.shippingPhone}</div>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <FaMapMarkerAlt className="order-detail-row-icon" />
                      <div>
                        <div className="row-label">Địa chỉ</div>
                        <div className="row-value">
                          {[selectedOrder.detailAddress, selectedOrder.ward, selectedOrder.district, selectedOrder.province].filter(Boolean).join(", ")}
                        </div>
                      </div>
                    </div>
                    {selectedOrder.shippingNote && (
                      <div className="order-detail-row">
                        <FaStickyNote className="order-detail-row-icon" />
                        <div>
                          <div className="row-label">Ghi chú</div>
                          <div className="row-value" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                            {selectedOrder.shippingNote}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="order-detail-section">
                  <h4 className="order-detail-section-title"><FaCreditCard /> Thanh toán & Tóm tắt</h4>
                  <div className="order-detail-info-rows">
                    <div className="order-detail-row">
                      <FaCreditCard className="order-detail-row-icon" />
                      <div>
                        <div className="row-label">Phương thức</div>
                        <div className="row-value">{PAYMENT_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod || "—"}</div>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <FaCalendarAlt className="order-detail-row-icon" />
                      <div>
                        <div className="row-label">Ngày đặt hàng</div>
                        <div className="row-value">
                          {selectedOrder.createdAt
                            ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </div>
                      </div>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="order-detail-row">
                        <FaTag className="order-detail-row-icon" />
                        <div>
                          <div className="row-label">Giảm giá</div>
                          <div className="row-value" style={{ color: "#ef4444" }}>
                            -{Number(selectedOrder.discountAmount).toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="order-detail-row order-total-row">
                      <FaShoppingBag className="order-detail-row-icon" style={{ color: "var(--accent-green)" }} />
                      <div>
                        <div className="row-label">Tổng cộng</div>
                        <div className="row-value" style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--accent-green)" }}>
                          {Number(selectedOrder.totalPrice || 0).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div className="order-detail-section">
                <h4 className="order-detail-section-title"><FaBoxOpen /> Sản phẩm trong đơn ({selectedOrder.orderItems?.length || 0} sản phẩm)</h4>
                <div className="order-items-list">
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <div key={item.id || idx} className="order-item-card">
                      {item.productImageUrl && (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="order-item-img"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      )}
                      <div className="order-item-info">
                        <div className="order-item-name">{item.productName}</div>
                        {item.variantName && (
                          <div className="order-item-variant">Phân loại: {item.variantName}</div>
                        )}
                        <div className="order-item-price">
                          {Number(item.price || 0).toLocaleString("vi-VN")}đ × {item.quantity}
                        </div>
                      </div>
                      <div className="order-item-subtotal">
                        {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="admin-modal-footer">
              <button onClick={() => setSelectedOrder(null)} className="btn-action-delete" style={{ padding: "10px 24px" }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
