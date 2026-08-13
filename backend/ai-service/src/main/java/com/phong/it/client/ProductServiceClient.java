package com.phong.it.client;

import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.helper.ApiResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "product-service-api")
@Path("/api/v1/products")
public interface ProductServiceClient {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<List<ProductResponseDTO>> getAllProducts();
}
