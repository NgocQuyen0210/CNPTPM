package com.phong.it.resource;

import java.util.List;

import com.phong.it.dto.request.UserRegisterRequestDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.UserService;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

/**
 * RESTful API cho đối tượng User.
 */
@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    /**
     * API Lấy danh sách người dùng (có phân trang)
     * GET: /api/users?page=0&size=10
     */
    @GET
    public Response getAllUsers(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {

        List<UserResponseDTO> users = userService.getAllUsers(page, size);
        return Response.ok(ApiResponse.success(users)).build();
    }

    /**
     * API Lấy chi tiết thông tin một người dùng
     * GET: /api/users/{id}
     */
    @GET
    @Path("/{id}")
    public Response getUserById(@PathParam("id") Long id) {
        UserResponseDTO user = userService.getUserById(id);
        return Response.ok(ApiResponse.success(user)).build();
    }

    /**
     * API Tạo mới người dùng
     * POST: /api/users
     */
    @POST
    public Response createUser(@Valid UserRegisterRequestDTO requestDTO) {
        UserResponseDTO createdUser = userService.createUser(requestDTO);
        return Response.status(Status.CREATED).entity(ApiResponse.success(createdUser, "Tạo mới người dùng thành công"))
                .build();
    }

    /**
     * API Cập nhật thông tin người dùng
     * PUT: /api/users/{id}
     */
    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") Long id, @Valid UserRegisterRequestDTO requestDTO) {
        UserResponseDTO updatedUser = userService.updateUser(id, requestDTO);
        return Response.ok(ApiResponse.success(updatedUser, "Cập nhật người dùng thành công")).build();
    }

    /**
     * API Xóa người dùng
     * DELETE: /api/users/{id}
     */
    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") Long id) {
        userService.deleteUser(id);
        return Response.ok(ApiResponse.success(null, "Xóa người dùng thành công")).build();
    }
}
