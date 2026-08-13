package com.phong.it.dto.response;

import java.time.Instant;

public record TokenResponseDTO(
    String token,
    Instant expiryDate
) {
}
