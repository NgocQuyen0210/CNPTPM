package com.phong.it.dto.response;

import java.time.LocalDateTime;
import com.phong.it.entity.MovementType;

public record StockMovementResponseDTO(
    Long id,
    Long variantId,
    String variantName,
    Integer quantity,
    MovementType movementType,
    String note,
    LocalDateTime createdAt
) {
}
