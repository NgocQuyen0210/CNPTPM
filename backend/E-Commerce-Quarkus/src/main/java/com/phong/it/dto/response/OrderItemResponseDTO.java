package com.phong.it.dto.response;

import java.math.BigDecimal;

public record OrderItemResponseDTO(
    Long id,
    Integer quantity,
    BigDecimal price,
    Long variantId,
    String variantName,
    String productName
) {
}
