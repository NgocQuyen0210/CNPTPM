package com.phong.it.dto.response;

public record SupplierResponseDTO(
    Long id,
    String name,
    String contactName,
    String email,
    String phone,
    String address
) {
}
