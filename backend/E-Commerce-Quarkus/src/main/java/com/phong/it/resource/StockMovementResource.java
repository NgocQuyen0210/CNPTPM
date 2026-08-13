package com.phong.it.resource;

import com.phong.it.dto.request.StockMovementRequestDTO;
import com.phong.it.dto.response.StockMovementResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.StockMovementService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/stock-movements")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN"})
public class StockMovementResource {

    @Inject
    StockMovementService stockMovementService;

    @POST
    public Response create(@Valid StockMovementRequestDTO requestDTO) {
        StockMovementResponseDTO responseDTO = stockMovementService.create(requestDTO);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(responseDTO, "Tạo lịch sử kho thành công"))
                .build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        StockMovementResponseDTO responseDTO = stockMovementService.getById(id);
        return Response.ok(ApiResponse.success(responseDTO)).build();
    }

    @GET
    public Response getAll() {
        List<StockMovementResponseDTO> stockMovements = stockMovementService.getAll();
        return Response.ok(ApiResponse.success(stockMovements)).build();
    }
}
