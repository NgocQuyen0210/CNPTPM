package com.phong.it.resource;

import com.phong.it.dto.request.WishlistRequestDTO;
import com.phong.it.dto.response.WishlistResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.WishlistService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.util.List;

@Path("/api/v1/wishlists")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class WishlistResource {

    @Inject
    WishlistService wishlistService;

    @Inject
    JsonWebToken jwt;

    private Long getUserId() {
        return Long.parseLong(jwt.getSubject());
    }

    @POST
    public Response addToWishlist(@Valid WishlistRequestDTO requestDTO) {
        Long userId = getUserId();
        WishlistResponseDTO responseDTO = wishlistService.addToWishlist(userId, requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(responseDTO, "Thêm vào danh sách yêu thích thành công"))
                .build();
    }

    @GET
    public Response getWishlist() {
        Long userId = getUserId();
        List<WishlistResponseDTO> wishlist = wishlistService.getWishlistByUserId(userId);
        return Response.ok(ApiResponse.success(wishlist)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response removeFromWishlist(@PathParam("id") Long id) {
        Long userId = getUserId();
        wishlistService.removeFromWishlist(userId, id);
        return Response.ok(ApiResponse.success(null, "Xóa khỏi danh sách yêu thích thành công")).build();
    }
}
