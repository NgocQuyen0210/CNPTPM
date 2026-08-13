package com.phong.it.dto.response;

public record AddressResponseDTO(
    Long id,
    String fullName,
    String phoneNumber,
    String province,
    String district,
    String ward,
    String detailAddress,
    Boolean isDefault,
    Long userId
) {
}
