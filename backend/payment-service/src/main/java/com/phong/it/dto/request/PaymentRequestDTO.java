package com.phong.it.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

public record PaymentRequestDTO(
    @NotNull(message = "ID Đơn hàng không được để trống")
    Long orderId,

    @NotNull(message = "Số tiền thanh toán không được để trống")
    BigDecimal amount,

    String paymentInfo
) {
}
