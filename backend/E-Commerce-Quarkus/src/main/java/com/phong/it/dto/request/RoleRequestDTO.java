package com.phong.it.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RoleRequestDTO(
    @NotBlank(message = "Tên không được để trống")
    String name,

    @NotBlank(message = "Mô tả không được để trống")
    String description
) {
}
