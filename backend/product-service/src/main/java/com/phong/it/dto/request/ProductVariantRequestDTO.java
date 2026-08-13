package com.phong.it.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductVariantRequestDTO(
    @NotBlank(message = "Tên không được để trống")
    String name,

    @NotBlank(message = "SKU không được để trống")
    String sku,

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    BigDecimal price,

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @PositiveOrZero(message = "Số lượng tồn kho không được âm")
    Integer stockQuantity,

    @NotNull(message = "ID sản phẩm không được để trống")
    Long productId
) {
}
