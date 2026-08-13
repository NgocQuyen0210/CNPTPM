package com.phong.it.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.phong.it.entity.PaymentStatus;

public record PaymentResponseDTO(
    Long id,
    String transactionId,
    String vnpTransactionNo,
    BigDecimal amount,
    String bankCode,
    PaymentStatus paymentStatus,
    String vnpResponseCode,
    String paymentInfo,
    LocalDateTime createdAt,
    Long orderId
) {
}
