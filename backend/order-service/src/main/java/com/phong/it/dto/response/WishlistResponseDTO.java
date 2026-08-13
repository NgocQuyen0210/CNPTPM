package com.phong.it.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WishlistResponseDTO(
    Long id,
    Long productId,
    String productName,
    BigDecimal productPrice,
    String productImage,
    LocalDateTime createdAt
) {
}
