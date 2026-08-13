package com.phong.it.resource;

import com.phong.it.dto.request.ReviewRequestDTO;
import com.phong.it.dto.response.ReviewResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.ReviewService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.util.List;

@Path("/api/v1/reviews")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReviewResource {

    @Inject
    ReviewService reviewService;

    @Inject
    JsonWebToken jwt;

    private Long getUserId() {
        return Long.parseLong(jwt.getSubject());
    }

    @POST
    @Authenticated
    public Response create(@Valid ReviewRequestDTO requestDTO) {
        Long userId = getUserId();
        ReviewResponseDTO responseDTO = reviewService.create(userId, requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(responseDTO, "Gửi đánh giá thành công"))
                .build();
    }

    @GET
    @RolesAllowed({"ADMIN"})
    public Response getAll() {
        List<ReviewResponseDTO> reviews = reviewService.getAll();
        return Response.ok(ApiResponse.success(reviews)).build();
    }

    @GET
    @Path("/product/{productId}")
    @PermitAll
    public Response getReviewsByProductId(
            @PathParam("productId") Long productId, 
            @QueryParam("approvedOnly") @DefaultValue("true") boolean approvedOnly) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByProductId(productId, approvedOnly);
        return Response.ok(ApiResponse.success(reviews)).build();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") Long id) {
        ReviewResponseDTO responseDTO = reviewService.getById(id);
        return Response.ok(ApiResponse.success(responseDTO)).build();
    }

    @PUT
    @Path("/{id}")
    @Authenticated
    public Response update(@PathParam("id") Long id, @Valid ReviewRequestDTO requestDTO) {
        Long userId = getUserId();
        ReviewResponseDTO responseDTO = reviewService.update(userId, id, requestDTO);
        return Response.ok(ApiResponse.success(responseDTO, "Cập nhật đánh giá thành công")).build();
    }

    @PUT
    @Path("/{id}/approve")
    @RolesAllowed({"ADMIN"})
    public Response approveReview(@PathParam("id") Long id) {
        ReviewResponseDTO responseDTO = reviewService.approveReview(id);
        return Response.ok(ApiResponse.success(responseDTO, "Duyệt đánh giá thành công")).build();
    }

    @DELETE
    @Path("/{id}")
    @Authenticated
    public Response delete(@PathParam("id") Long id) {
        Long userId = getUserId();
        reviewService.delete(userId, id);
        return Response.ok(ApiResponse.success(null, "Xóa đánh giá thành công")).build();
    }
}
