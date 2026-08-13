package com.phong.it.dto.request;

import jakarta.validation.constraints.NotNull;

public record WishlistRequestDTO(
    @NotNull(message = "ID sản phẩm không được để trống")
    Long productId
) {
}
