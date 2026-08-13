package com.phong.it.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

@Provider
public class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException> {

    private static final Logger LOG = Logger.getLogger(WebApplicationExceptionMapper.class);

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(WebApplicationException exception) {
        Response response = exception.getResponse();
        int status = response.getStatus();
        Response.StatusType statusInfo = response.getStatusInfo();
        String errorName = statusInfo.getReasonPhrase();
        String message = exception.getMessage();

        // Resteasy mặc định đôi khi thêm "HTTP <code/message> " trước thông điệp, chúng ta có thể làm sạch nếu cần
        if (message != null && message.startsWith("HTTP " + status + " ")) {
            message = message.substring(("HTTP " + status + " ").length());
        }

        LOG.warnf("Lỗi nghiệp vụ JAX-RS tại %s: Status %d (%s) - %s", 
                uriInfo.getRequestUri().getPath(), status, errorName, message);

        ErrorMessage errorMessage = new ErrorMessage(
                LocalDateTime.now(),
                status,
                errorName,
                message,
                uriInfo.getRequestUri().getPath()
        );

        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(errorMessage)
                .build();
    }
}
