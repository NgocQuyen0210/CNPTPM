package com.phong.it.dto.response;

public record ProductImageResponseDTO(
    Long id,
    String imageUrl,
    Boolean isMain,
    Long sortOrder,
    Long productId
) {
}
