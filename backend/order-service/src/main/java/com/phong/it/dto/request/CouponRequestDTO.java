package com.phong.it.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CouponRequestDTO(
    @NotBlank(message = "Mã giảm giá không được để trống")
    String code,

    String description,

    @NotNull(message = "Loại giảm giá không được để trống")
    String discountType,

    @NotNull(message = "Giá trị giảm giá không được để trống")
    BigDecimal discountValue,

    BigDecimal minOrderValue,
    
    BigDecimal maxDiscountValue,

    @FutureOrPresent(message = "Ngày bắt đầu không được trong quá khứ")
    LocalDateTime startDate,

    LocalDateTime endDate,

    Integer usageLimit,

    Boolean isActive
) {
}
