package com.phong.it.dto.response;

import java.math.BigDecimal;

public record CartItemResponseDTO(
    Long id,
    Integer quantity,
    Long variantId,
    String variantName,
    BigDecimal price,
    String productName,
    String image
) {
}
