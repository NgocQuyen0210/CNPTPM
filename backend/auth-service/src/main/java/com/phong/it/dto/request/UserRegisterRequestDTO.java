package com.phong.it.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterRequestDTO(
    @NotBlank(message = "Tên không được để trống")
    String username,

    @Email(message = "Email không hợp lệ")
    String email,

    String password,

    String confirmPassword,

    @NotBlank(message = "Họ và tên không được để trống")
    String fullName
) {
}
