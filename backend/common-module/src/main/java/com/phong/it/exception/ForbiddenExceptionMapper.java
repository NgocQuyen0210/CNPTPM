package com.phong.it.exception;

import io.quarkus.security.ForbiddenException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

@Provider
public class ForbiddenExceptionMapper implements ExceptionMapper<ForbiddenException> {

    private static final Logger LOG = Logger.getLogger(ForbiddenExceptionMapper.class);

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(ForbiddenException exception) {
        String path = uriInfo.getRequestUri().getPath();
        LOG.warnf("Lỗi phân quyền từ chối truy cập (Forbidden) tại %s: %s", path, exception.getMessage());

        ErrorMessage errorMessage = new ErrorMessage(
                LocalDateTime.now(),
                Response.Status.FORBIDDEN.getStatusCode(),
                Response.Status.FORBIDDEN.getReasonPhrase(),
                "Bạn không có quyền hạn truy cập tài nguyên này.",
                path
        );

        return Response.status(Response.Status.FORBIDDEN)
                .type(MediaType.APPLICATION_JSON)
                .entity(errorMessage)
                .build();
    }
}
