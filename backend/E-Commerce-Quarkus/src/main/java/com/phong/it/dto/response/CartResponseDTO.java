package com.phong.it.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record CartResponseDTO(
    Long id,
    LocalDateTime updatedAt,
    Long userId,
    List<CartItemResponseDTO> items
) {
}
