import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import orderService from "../../../services/orderService";
import { FaShoppingBag, FaTruck, FaCheck, FaTimes, FaUndo, FaMapMarkerAlt } from "react-icons/fa";
import "./OrderHistory.css";

function OrderHistory() {
  const navigate = useNavigate();
  const { showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderHistory();
      setOrders(res || []);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đơn hàng:", err);
      showToast("Không thể tải lịch sử đơn hàng. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, actionName) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await orderService.updateStatus(orderId, newStatus);
      showToast(`Đã thực hiện "${actionName}" thành công!`);
      fetchOrders();
    } catch (err) {
      console.error(`Lỗi khi thực hiện ${actionName}:`, err);
      showToast(`Thao tác "${actionName}" thất bại. Vui lòng thử lại!`, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusTextAndClass = (status) => {
    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return { text: "Chuẩn bị hàng", class: "processing" };
      case "SHIPPED":
        return { text: "Đang giao hàng", class: "shipped" };
      case "DELIVERED":
        return { text: "Hàng đã giao đến bạn", class: "delivered" };
      case "CANCELLED":
        return { text: "Đã hủy", class: "cancelled" };
      case "COMPLETED":
        return { text: "Đã nhận hàng", class: "completed" };
      case "RETURNED":
        return { text: "Đã hoàn hàng", class: "returned" };
      default:
        return { text: status, class: "unknown" };
    }
  };

  const getStepperState = (status) => {
    // Returns active index (0, 1, 2) and completion percentage for the progress line
    if (status === "CANCELLED") {
      return { activeStep: -1, width: "0%" };
    }
    
    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return { activeStep: 0, width: "0%" };
      case "SHIPPED":
        return { activeStep: 1, width: "50%" };
      case "DELIVERED":
        return { activeStep: 2, width: "100%" };
      case "COMPLETED":
      case "RETURNED":
        return { activeStep: 3, width: "100%" };
      default:
        return { activeStep: 0, width: "0%" };
    }
  };

  if (loading) {
    return (
      <div className="order-history-container" style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải dữ liệu đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h2 className="order-history-title">
        <FaShoppingBag /> Lịch sử & Theo dõi đơn hàng
      </h2>

      {orders.length === 0 ? (
        <div className="order-history-empty">
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và đặt đơn hàng đầu tiên của bạn!</p>
          <button onClick={() => navigate("/dashboard/menu")} className="premium-btn" style={{ padding: "12px 30px", fontSize: "14px" }}>
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const statusInfo = getStatusTextAndClass(order.status);
            const stepperInfo = getStepperState(order.status);
            const isPendingOrProcessing = order.status === "PENDING" || order.status === "PROCESSING";
            const isDelivered = order.status === "DELIVERED";
            const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            const isButtonDisabled = actionLoading[order.id];

            return (
              <div key={order.id} className="order-card">
                {/* Header */}
                <div className="order-card-header">
                  <div className="order-meta-info">
                    <span className="order-id">Mã đơn hàng: #{order.id}</span>
                    <span className="order-date">Đặt lúc: {formattedDate}</span>
                  </div>
                  <div className="order-header-right">
                    <span className={`status-tag ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="order-card-body">
                  {/* Stepper Timeline */}
                  {order.status !== "CANCELLED" && (
                    <div className="order-tracking-stepper">
                      <div className="stepper-progress-bar">
                        <div className="stepper-progress-fill" style={{ width: stepperInfo.width }}></div>
                      </div>
                      
                      <div className={`step-node ${stepperInfo.activeStep >= 0 ? (stepperInfo.activeStep > 0 ? "completed" : "active") : ""}`}>
                        <div className="step-dot">1</div>
                        <span className="step-label">Chuẩn bị hàng</span>
                      </div>

                      <div className={`step-node ${stepperInfo.activeStep >= 1 ? (stepperInfo.activeStep > 1 ? "completed" : "active") : ""}`}>
                        <div className="step-dot">2</div>
                        <span className="step-label">Đang giao hàng</span>
                      </div>

                      <div className={`step-node ${stepperInfo.activeStep >= 2 ? (stepperInfo.activeStep > 2 ? "completed" : "active") : ""}`}>
                        <div className="step-dot">3</div>
                        <span className="step-label">Hàng đã giao</span>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="order-items-list">
                    {order.orderItems && order.orderItems.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <div className="order-item-info">
                          <span className="order-item-name">{item.productName}</span>
                          <span className="order-item-variant">Phân loại: {item.variantName}</span>
                        </div>
                        <div className="order-item-qty-price">
                          {item.quantity} x {Number(item.price).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Box */}
                  <div className="shipping-info-box">
                    <div className="shipping-info-title">
                      <FaMapMarkerAlt /> Thông tin giao hàng
                    </div>
                    <div><strong>Người nhận:</strong> {order.shippingFullName} - {order.shippingPhone}</div>
                    <div><strong>Địa chỉ:</strong> {order.detailAddress}, {order.ward}, {order.district}, {order.province}</div>
                    {order.shippingNote && <div><strong>Ghi chú:</strong> <em>{order.shippingNote}</em></div>}
                  </div>
                </div>

                {/* Footer & Actions */}
                <div className="order-card-footer">
                  <div>
                    <span className="order-total-label">Tổng thanh toán: </span>
                    <span className="order-total-price">
                      {Number(order.totalPrice).toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="order-actions">
                    {isPendingOrProcessing && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleUpdateStatus(order.id, "CANCELLED", "Hủy đơn hàng")}
                        disabled={isButtonDisabled}
                      >
                        Hủy Đơn Hàng
                      </button>
                    )}

                    {isDelivered && (
                      <>
                        <button
                          className="btn-receive"
                          onClick={() => handleUpdateStatus(order.id, "COMPLETED", "Đã nhận hàng")}
                          disabled={isButtonDisabled}
                        >
                          <FaCheck /> Nhận Hàng
                        </button>
                        <button
                          className="btn-return"
                          onClick={() => handleUpdateStatus(order.id, "RETURNED", "Hoàn hàng")}
                          disabled={isButtonDisabled}
                        >
                          <FaUndo /> Hoàn Hàng
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
