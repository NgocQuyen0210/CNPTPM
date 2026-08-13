package com.phong.it.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductImageRequestDTO(
        @NotBlank(message = "URL ảnh không được để trống") String imageUrl,

        Boolean isMain,

        Long sortOrder,

        @NotNull(message = "ID sản phẩm không được để trống") Long productId) {
}