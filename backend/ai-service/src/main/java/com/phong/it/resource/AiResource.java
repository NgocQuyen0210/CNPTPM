package com.phong.it.resource;

import com.phong.it.dto.AiConsultRequest;
import com.phong.it.dto.AiConsultResponse;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.AiService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/ai")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AiResource {

    @Inject
    AiService aiService;

    @POST
    @Path("/consult")
    @PermitAll
    public Response consult(@Valid AiConsultRequest request) {
        AiConsultResponse response = aiService.consult(request);
        return Response.ok(ApiResponse.success(response)).build();
    }
}
