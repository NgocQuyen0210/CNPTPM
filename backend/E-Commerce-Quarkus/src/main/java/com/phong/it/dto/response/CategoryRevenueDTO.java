package com.phong.it.dto.response;

import java.math.BigDecimal;

public record CategoryRevenueDTO(
        Long categoryId,
        String categoryName,
        BigDecimal revenue
) {}
