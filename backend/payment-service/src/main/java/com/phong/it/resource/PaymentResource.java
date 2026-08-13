package com.phong.it.resource;

import java.util.HashMap;
import java.util.Map;
import com.phong.it.dto.request.PaymentRequestDTO;
import com.phong.it.dto.response.PaymentResponseDTO;
import com.phong.it.entity.Payment;
import com.phong.it.helper.ApiResponse;
import com.phong.it.mapper.PaymentMapper;
import com.phong.it.service.PaymentService;
import io.quarkus.security.Authenticated;
import io.vertx.core.http.HttpServerRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("/api/payments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PaymentResource {
    @Inject
    PaymentService paymentService;

    @Inject
    PaymentMapper paymentMapper;

    @Context
    HttpServerRequest request;

    @POST
    @Path("/create-vnpay")
    @Authenticated
    public Response createPaymentUrl(@Valid PaymentRequestDTO requestDTO) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.remoteAddress().hostAddress();
        }

        String paymentUrl = paymentService.createPayment(requestDTO, ipAddress);

        return Response.ok(ApiResponse.success(Map.of("url", paymentUrl), "Tạo URL thanh toán thành công")).build();
    }

    @GET
    @Path("/vnpay-return")
    @PermitAll
    public Response vnpayReturn(@Context UriInfo uriInfo) {
        Map<String, String> queryParams = new HashMap<>();
        uriInfo.getQueryParameters().forEach((key, value) -> queryParams.put(key, value.get(0)));

        Payment resultPayment = paymentService.processReturn(queryParams);
        PaymentResponseDTO responseDTO = paymentMapper.toDto(resultPayment);

        return Response.ok(ApiResponse.success(responseDTO, "Xử lý kết quả thanh toán thành công")).build();
    }

    @GET
    @Path("/vnpay-ipn")
    @PermitAll
    public Response vnpayIpn(@Context UriInfo uriInfo) {
        try {
            Map<String, String> queryParams = new HashMap<>();
            uriInfo.getQueryParameters().forEach((key, value) -> queryParams.put(key, value.get(0)));

            paymentService.processReturn(queryParams);
            
            return Response.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}").build();
        } catch (IllegalArgumentException e) {
            return Response.ok("{\"RspCode\":\"99\",\"Message\":\"" + e.getMessage() + "\"}").build();
        } catch (Exception e) {
            return Response.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}").build();
        }
    }
}
