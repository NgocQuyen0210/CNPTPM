package com.phong.it.resource;

import com.phong.it.dto.request.OrderRequestDTO;
import com.phong.it.dto.response.OrderResponseDTO;
import com.phong.it.entity.OrderStatus;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.OrderService;
import io.quarkus.security.Authenticated;
import org.eclipse.microprofile.jwt.JsonWebToken;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class OrderResource {

    @Inject
    OrderService orderService;

    @Inject
    JsonWebToken jwt;

    private Long getUserId() {
        return Long.parseLong(jwt.getSubject());
    }

    @POST
    public Response placeOrder(@Valid OrderRequestDTO requestDTO) {
        Long userId = getUserId();
        OrderResponseDTO responseDTO = orderService.placeOrder(userId, requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(responseDTO, "Đặt hàng thành công"))
                .build();
    }

    @GET
    public Response getOrderHistory() {
        Long userId = getUserId();
        List<OrderResponseDTO> orders = orderService.getOrderHistory(userId);
        return Response.ok(ApiResponse.success(orders)).build();
    }

    @GET
    @Path("/{id}")
    public Response getOrderById(@PathParam("id") Long id) {
        OrderResponseDTO responseDTO = orderService.getOrderById(id);
        return Response.ok(ApiResponse.success(responseDTO)).build();
    }

    @PUT
    @Path("/{id}/status")
    public Response updateStatus(@PathParam("id") Long id, @QueryParam("status") OrderStatus status) {
        if (status == null) {
            throw new BadRequestException("Vui lòng cung cấp trạng thái (status) hợp lệ");
        }
        OrderResponseDTO responseDTO = orderService.updateStatus(id, status);
        return Response.ok(ApiResponse.success(responseDTO, "Cập nhật trạng thái đơn hàng thành công")).build();
    }
}
