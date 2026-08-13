package com.phong.it.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequestDTO(
    @NotBlank(message = "Tên không được để trống")
    String name,

    @NotBlank(message = "Slug không được để trống")
    String slug,

    @NotBlank(message = "Trường mô tả không được để trống")
    String description,

    Long parentId
) {
}
