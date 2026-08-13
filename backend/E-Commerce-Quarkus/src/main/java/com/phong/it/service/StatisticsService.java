package com.phong.it.service;

import com.phong.it.dto.response.CategoryRevenueDTO;
import com.phong.it.dto.response.RevenueOverTimeDTO;
import com.phong.it.dto.response.StatisticsOverviewDTO;
import com.phong.it.dto.response.TopProductDTO;

import java.util.List;

public interface StatisticsService {
    StatisticsOverviewDTO getOverview();
    List<RevenueOverTimeDTO> getRevenueOverTime(String interval);
    List<TopProductDTO> getTopSellingProducts(int limit);
    List<CategoryRevenueDTO> getRevenueByCategory();
}
