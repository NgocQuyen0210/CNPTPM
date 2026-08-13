package com.phong.it.resource;

import com.phong.it.dto.request.CouponRequestDTO;
import com.phong.it.dto.response.CouponResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.CouponService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/v1/coupons")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CouponResource {

    @Inject
    CouponService couponService;

    @GET
    public Response getAll() {
        List<CouponResponseDTO> coupons = couponService.getAll();
        return Response.ok(ApiResponse.success(coupons)).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        CouponResponseDTO coupon = couponService.getById(id);
        return Response.ok(ApiResponse.success(coupon)).build();
    }

    @POST
    public Response create(@Valid CouponRequestDTO requestDTO) {
        CouponResponseDTO created = couponService.create(requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(created, "Tạo mã giảm giá thành công"))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, @Valid CouponRequestDTO requestDTO) {
        CouponResponseDTO updated = couponService.update(id, requestDTO);
        return Response.ok(ApiResponse.success(updated, "Cập nhật mã giảm giá thành công")).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        couponService.delete(id);
        return Response.ok(ApiResponse.success(null, "Xóa mã giảm giá thành công")).build();
    }

    @GET
    @Path("/validate")
    public Response validateCoupon(@QueryParam("code") String code, @QueryParam("orderValue") BigDecimal orderValue) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Vui lòng cung cấp mã giảm giá (code)");
        }
        if (orderValue == null) {
            throw new BadRequestException("Vui lòng cung cấp giá trị đơn hàng (orderValue)");
        }

        CouponResponseDTO validCoupon = couponService.validateCoupon(code, orderValue);
        BigDecimal discountAmount = couponService.calculateDiscount(code, orderValue);

        // Trả về thông tin coupon hợp lệ kèm số tiền sẽ được giảm
        Map<String, Object> response = new HashMap<>();
        response.put("coupon", validCoupon);
        response.put("discountAmount", discountAmount);

        return Response.ok(ApiResponse.success(response, "Áp dụng mã giảm giá thành công")).build();
    }
}
