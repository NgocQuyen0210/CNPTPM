package com.phong.it.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterRequestDTO(
    @NotBlank(message = "Tên không được để trống")
    String username,

    @Email(message = "Email không hợp lệ")
    String email,

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Password phải từ 6 ký tự")
    String password,

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    String confirmPassword,

    @NotBlank(message = "Họ và tên không được để trống")
    String fullName
) {
}
