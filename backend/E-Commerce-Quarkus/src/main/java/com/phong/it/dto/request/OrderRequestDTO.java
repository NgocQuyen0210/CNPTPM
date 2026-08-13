package com.phong.it.dto.request;

import com.phong.it.entity.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record OrderRequestDTO(
        @NotBlank(message = "Họ tên người nhận không được để trống") String shippingFullName,

        @NotBlank(message = "Số điện thoại không được để trống") @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ") String shippingPhone,

        @NotBlank(message = "Tỉnh/Thành phố không được để trống") String province,

        @NotBlank(message = "Quận/Huyện không được để trống") String district,

        @NotBlank(message = "Phường/Xã không được để trống") String ward,

        @NotBlank(message = "Địa chỉ chi tiết không được để trống") String detailAddress,

        String shippingNote,

        @NotNull(message = "Phương thức thanh toán không được để trống") PaymentMethod paymentMethod,

        String couponCode) {
}
