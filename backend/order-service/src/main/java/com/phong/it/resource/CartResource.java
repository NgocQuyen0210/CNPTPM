package com.phong.it.resource;

import com.phong.it.dto.request.AddToCartRequestDTO;
import com.phong.it.dto.response.CartResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.CartService;
import io.quarkus.security.Authenticated;
import org.eclipse.microprofile.jwt.JsonWebToken;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/cart")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class CartResource {

    @Inject
    CartService cartService;

    @Inject
    JsonWebToken jwt;

    private Long getUserId() {
        return Long.parseLong(jwt.getSubject());
    }

    @GET
    public Response getCart() {
        Long userId = getUserId();
        CartResponseDTO responseDTO = cartService.getCartByUserId(userId);
        return Response.ok(ApiResponse.success(responseDTO)).build();
    }

    @POST
    @Path("/items")
    public Response addToCart(@Valid AddToCartRequestDTO requestDTO) {
        Long userId = getUserId();
        CartResponseDTO responseDTO = cartService.addToCart(userId, requestDTO);
        return Response.ok(ApiResponse.success(responseDTO, "Thêm sản phẩm vào giỏ hàng thành công")).build();
    }

    @PUT
    @Path("/items/{itemId}")
    public Response updateQuantity(
            @PathParam("itemId") Long itemId, 
            @QueryParam("quantity") Integer quantity) {
        Long userId = getUserId();
        if (quantity == null) {
            throw new BadRequestException("Vui lòng cung cấp tham số quantity (số lượng)");
        }
        CartResponseDTO responseDTO = cartService.updateQuantity(userId, itemId, quantity);
        return Response.ok(ApiResponse.success(responseDTO, "Cập nhật số lượng thành công")).build();
    }

    @DELETE
    @Path("/items/{itemId}")
    public Response removeItem(@PathParam("itemId") Long itemId) {
        Long userId = getUserId();
        CartResponseDTO responseDTO = cartService.removeItem(userId, itemId);
        return Response.ok(ApiResponse.success(responseDTO, "Xóa sản phẩm khỏi giỏ hàng thành công")).build();
    }
}
