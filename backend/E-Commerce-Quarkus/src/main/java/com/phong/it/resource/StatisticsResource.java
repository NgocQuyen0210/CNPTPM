package com.phong.it.resource;

import com.phong.it.dto.response.CategoryRevenueDTO;
import com.phong.it.dto.response.RevenueOverTimeDTO;
import com.phong.it.dto.response.StatisticsOverviewDTO;
import com.phong.it.dto.response.TopProductDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.StatisticsService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/admin/statistics")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN"})
public class StatisticsResource {

    @Inject
    StatisticsService statisticsService;

    @GET
    @Path("/overview")
    public Response getOverview() {
        StatisticsOverviewDTO overview = statisticsService.getOverview();
        return Response.ok(ApiResponse.success(overview, "Lấy số liệu tổng quan thành công")).build();
    }

    @GET
    @Path("/revenue-over-time")
    public Response getRevenueOverTime(@QueryParam("interval") @DefaultValue("month") String interval) {
        List<RevenueOverTimeDTO> data = statisticsService.getRevenueOverTime(interval);
        return Response.ok(ApiResponse.success(data, "Lấy doanh thu theo thời gian thành công")).build();
    }

    @GET
    @Path("/top-selling")
    public Response getTopSellingProducts(@QueryParam("limit") @DefaultValue("5") int limit) {
        List<TopProductDTO> data = statisticsService.getTopSellingProducts(limit);
        return Response.ok(ApiResponse.success(data, "Lấy danh sách sản phẩm bán chạy thành công")).build();
    }

    @GET
    @Path("/category-revenue")
    public Response getRevenueByCategory() {
        List<CategoryRevenueDTO> data = statisticsService.getRevenueByCategory();
        return Response.ok(ApiResponse.success(data, "Lấy doanh thu theo danh mục thành công")).build();
    }
}
