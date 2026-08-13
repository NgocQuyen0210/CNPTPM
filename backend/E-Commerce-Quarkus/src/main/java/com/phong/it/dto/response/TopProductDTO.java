package com.phong.it.dto.response;

import java.math.BigDecimal;

public record TopProductDTO(
        Long productId,
        String productName,
        long totalQuantity,
        BigDecimal totalRevenue
) {}
