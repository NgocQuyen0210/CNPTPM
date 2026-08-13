package com.phong.it.entity;

public enum PaymentStatus {
    PENDING,   // Đang chờ thanh toán
    SUCCESS,   // Thanh toán thành công
    FAILED,    // Thanh toán thất bại
    CANCELLED  // Người dùng hủy giao dịch
}
