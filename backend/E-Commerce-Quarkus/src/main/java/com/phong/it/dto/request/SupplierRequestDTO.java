package com.phong.it.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SupplierRequestDTO(
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    String name,

    String contactName,

    @Email(message = "Email không hợp lệ")
    String email,

    String phone,

    String address
) {
}
