package com.phong.it.dto.response;

import java.math.BigDecimal;

public record ProductVariantResponseDTO(
    Long id,
    String name,
    String sku,
    BigDecimal price,
    Integer stockQuantity,
    Long productId
) {
}
