package com.phong.it.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AddressRequestDTO(
    @NotBlank(message = "Tên người nhận không được để trống")
    String fullName,

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10}$", message = "Số điện thoại không hợp lệ")
    String phoneNumber,

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    String province,

    @NotBlank(message = "Quận/Huyện không được để trống")
    String district,

    @NotBlank(message = "Phường/Xã không được để trống")
    String ward,

    @NotBlank(message = "Địa chỉ cụ thể không được để trống")
    String detailAddress,

    Boolean isDefault
    
) {
}
