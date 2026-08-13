package com.phong.it.dto.response;

import java.math.BigDecimal;

public record RevenueOverTimeDTO(
        String timePeriod,
        BigDecimal revenue,
        long orderCount
) {}
