package com.phong.it.resource;

import com.phong.it.dto.request.CategoryRequestDTO;
import com.phong.it.dto.response.CategoryResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.CategoryService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @Inject
    CategoryService categoryService;

    @POST
    @RolesAllowed({"ADMIN"})
    public Response create(@Valid CategoryRequestDTO requestDTO) {
        CategoryResponseDTO responseDTO = categoryService.create(requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(responseDTO, "Tạo danh mục thành công"))
                .build();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") Long id) {
        CategoryResponseDTO responseDTO = categoryService.getById(id);
        return Response.ok(ApiResponse.success(responseDTO)).build();
    }

    @GET
    @PermitAll
    public Response getAll() {
        List<CategoryResponseDTO> categories = categoryService.getAll();
        return Response.ok(ApiResponse.success(categories)).build();
    }

    @GET
    @Path("/roots")
    @PermitAll
    public Response getRootCategories() {
        List<CategoryResponseDTO> roots = categoryService.getRootCategories();
        return Response.ok(ApiResponse.success(roots)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    public Response update(@PathParam("id") Long id, @Valid CategoryRequestDTO requestDTO) {
        CategoryResponseDTO responseDTO = categoryService.update(id, requestDTO);
        return Response.ok(ApiResponse.success(responseDTO, "Cập nhật danh mục thành công")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    public Response delete(@PathParam("id") Long id) {
        categoryService.delete(id);
        return Response.ok(ApiResponse.success(null, "Xóa danh mục thành công")).build();
    }
}
