package com.phong.it.client;

import com.phong.it.dto.response.OrderResponseDTO;
import com.phong.it.entity.OrderStatus;
import com.phong.it.helper.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "order-service-api")
@Path("/api/v1/orders")
public interface OrderServiceClient {

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<OrderResponseDTO> getOrderById(@PathParam("id") Long id);

    @PUT
    @Path("/{id}/status")
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<OrderResponseDTO> updateStatus(@PathParam("id") Long id, @QueryParam("status") OrderStatus status);
}
