package com.phong.it.client;

import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.dto.response.ProductVariantResponseDTO;
import com.phong.it.helper.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;

@RegisterRestClient(configKey = "product-service-api")
@RegisterClientHeaders
public interface ProductServiceClient {

    @GET
    @Path("/api/v1/products/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<ProductResponseDTO> getProductById(@PathParam("id") Long id);

    @GET
    @Path("/api/v1/product-variants/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<ProductVariantResponseDTO> getVariantById(@PathParam("id") Long id);

    @POST
    @Path("/api/v1/stock-movements")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    ApiResponse<Void> createStockMovement(com.phong.it.dto.request.StockMovementRequestDTO requestDTO);

    @GET
    @Path("/api/v1/product-variants/product/{productId}")
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<java.util.List<ProductVariantResponseDTO>> getVariantsByProductId(@PathParam("productId") Long productId);
}
