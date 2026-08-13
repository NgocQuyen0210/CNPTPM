package com.phong.it.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponseDTO(
    Long id,
    String name,
    String slug,
    String summary,
    String content,
    String brand,
    BigDecimal price,
    String featuredImage,
    Long categoryId,
    String categoryName,
    Long supplierId,
    String supplierName,
    String status,
    List<ProductImageResponseDTO> images,
    List<ProductVariantResponseDTO> variants
) {
}
