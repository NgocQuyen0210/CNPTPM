package com.phong.it.resource;

import java.util.List;
import com.phong.it.dto.request.RoleRequestDTO;
import com.phong.it.dto.response.RoleResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.RoleService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/api/v1/roles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN"})
public class RoleResource {

    @Inject
    RoleService roleService;

    @GET
    public Response getAllRoles() {
        List<RoleResponseDTO> roles = roleService.getAllRoles();
        return Response.ok(ApiResponse.success(roles)).build();
    }

    @GET
    @Path("/{id}")
    public Response getRoleById(@PathParam("id") Long id) {
        RoleResponseDTO role = roleService.getRoleById(id);
        return Response.ok(ApiResponse.success(role)).build();
    }

    @POST
    public Response createRole(@Valid RoleRequestDTO requestDTO) {
        RoleResponseDTO createdRole = roleService.createRole(requestDTO);
        return Response.status(Status.CREATED)
                .entity(ApiResponse.success(createdRole, "Tạo mới Role thành công"))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Response updateRole(@PathParam("id") Long id, @Valid RoleRequestDTO requestDTO) {
        RoleResponseDTO updatedRole = roleService.updateRole(id, requestDTO);
        return Response.ok(ApiResponse.success(updatedRole, "Cập nhật Role thành công")).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteRole(@PathParam("id") Long id) {
        roleService.deleteRole(id);
        return Response.status(Status.NO_CONTENT).build();
    }
}
