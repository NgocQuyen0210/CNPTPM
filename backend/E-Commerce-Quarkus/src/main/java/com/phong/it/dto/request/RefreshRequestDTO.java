package com.phong.it.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequestDTO(
    @NotBlank(message = "Token không được để trống")
    String token
) {
}
