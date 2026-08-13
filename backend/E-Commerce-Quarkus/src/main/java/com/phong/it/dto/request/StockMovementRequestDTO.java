package com.phong.it.dto.request;

import com.phong.it.entity.MovementType;
import jakarta.validation.constraints.NotNull;

public record StockMovementRequestDTO(
    @NotNull(message = "ID biến thể không được để trống")
    Long variantId,

    @NotNull(message = "Số lượng không được để trống")
    Integer quantity,

    @NotNull(message = "Loại biến động không được để trống")
    MovementType movementType,

    String note
) {
}
