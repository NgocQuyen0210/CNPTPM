package com.phong.it.dto.response;

import java.time.LocalDateTime;

public record ReviewResponseDTO(
    Long id,
    Integer rating,
    String comment,
    Boolean status,
    LocalDateTime createdAt,
    String userFullName,
    Long productId,
    Long userId
) {
}
