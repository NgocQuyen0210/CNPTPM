package com.phong.it.entity;

public enum MovementType {
    IN,         // Nhập kho (từ nhà cung cấp)
    OUT,        // Xuất kho (bán hàng)
    ADJUSTMENT, // Điều chỉnh (kiểm kho, hàng lỗi)
    RETURN      // Khách trả hàng
}
