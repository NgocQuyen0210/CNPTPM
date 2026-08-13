package com.phong.it.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequestDTO(
    @NotBlank(message = "Tên sản phẩm không được để trống")
    String name,

    @NotBlank(message = "Slug không được để trống")
    String slug,

    String summary,
    String content,
    String brand,

    @NotNull(message = "Giá không được để trống")
    BigDecimal price,

    String featuredImage,

    Long categoryId,
    Long supplierId,
    String status
) {
}
