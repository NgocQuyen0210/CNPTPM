package com.phong.it.client;

import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.helper.ApiResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "auth-service-api")
@Path("/api/v1/users")
public interface AuthServiceClient {

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    ApiResponse<UserResponseDTO> getUserById(@PathParam("id") Long id);
}
