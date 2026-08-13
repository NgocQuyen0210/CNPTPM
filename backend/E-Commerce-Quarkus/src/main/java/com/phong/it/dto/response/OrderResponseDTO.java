package com.phong.it.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.phong.it.entity.OrderStatus;
import com.phong.it.entity.PaymentMethod;

public record OrderResponseDTO(
    Long id,
    BigDecimal totalPrice,
    OrderStatus status,
    String shippingFullName,
    String shippingPhone,
    String province,
    String district,
    String ward,
    String detailAddress,
    String shippingNote,
    LocalDateTime createdAt,
    Long userId,
    PaymentMethod paymentMethod,
    BigDecimal discountAmount,
    List<OrderItemResponseDTO> orderItems
) {
}
