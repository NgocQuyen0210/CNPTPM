package com.phong.it.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CouponResponseDTO(
    Long id,
    String code,
    String description,
    String discountType,
    BigDecimal discountValue,
    BigDecimal minOrderValue,
    BigDecimal maxDiscountValue,
    LocalDateTime startDate,
    LocalDateTime endDate,
    Boolean isActive
) {
}
