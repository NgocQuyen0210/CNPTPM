package com.phong.it.resource;

import com.phong.it.dto.request.AddressRequestDTO;
import com.phong.it.dto.response.AddressResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.AddressService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/v1/addresses")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AddressResource {

    @Inject
    AddressService addressService;

    @GET
    public Response getMyAddresses(@HeaderParam("User-ID") Long userId) {
        if (userId == null) {
            throw new BadRequestException("Vui lòng cung cấp User-ID trong Header");
        }
        List<AddressResponseDTO> addresses = addressService.getByUserId(userId);
        return Response.ok(ApiResponse.success(addresses)).build();
    }

    @POST
    public Response create(@HeaderParam("User-ID") Long userId, @Valid AddressRequestDTO requestDTO) {
        if (userId == null) {
            throw new BadRequestException("Vui lòng cung cấp User-ID trong Header");
        }
        AddressResponseDTO responseDTO = addressService.create(userId, requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(responseDTO, "Tạo địa chỉ thành công"))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@HeaderParam("User-ID") Long userId, @PathParam("id") Long id, @Valid AddressRequestDTO requestDTO) {
        if (userId == null) {
            throw new BadRequestException("Vui lòng cung cấp User-ID trong Header");
        }
        AddressResponseDTO responseDTO = addressService.update(userId, id, requestDTO);
        return Response.ok(ApiResponse.success(responseDTO, "Cập nhật địa chỉ thành công")).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@HeaderParam("User-ID") Long userId, @PathParam("id") Long id) {
        if (userId == null) {
            throw new BadRequestException("Vui lòng cung cấp User-ID trong Header");
        }
        addressService.delete(userId, id);
        return Response.ok(ApiResponse.success(null, "Xóa địa chỉ thành công")).build();
    }

    @PATCH
    @Path("/{id}/set-default")
    public Response setDefault(@HeaderParam("User-ID") Long userId, @PathParam("id") Long id) {
        if (userId == null) {
            throw new BadRequestException("Vui lòng cung cấp User-ID trong Header");
        }
        AddressResponseDTO responseDTO = addressService.setDefault(userId, id);
        return Response.ok(ApiResponse.success(responseDTO, "Đặt địa chỉ mặc định thành công")).build();
    }
}
