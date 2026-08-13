package com.phong.it.dto.response;

import java.math.BigDecimal;

public record StatisticsOverviewDTO(
        BigDecimal totalRevenue,
        long totalOrders,
        long totalProductsSold,
        long totalUsers
) {}
