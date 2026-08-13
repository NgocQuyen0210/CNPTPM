package com.phong.it.exception;

import io.quarkus.security.UnauthorizedException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

@Provider
public class UnauthorizedExceptionMapper implements ExceptionMapper<UnauthorizedException> {

    private static final Logger LOG = Logger.getLogger(UnauthorizedExceptionMapper.class);

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(UnauthorizedException exception) {
        String path = uriInfo.getRequestUri().getPath();
        LOG.warnf("Lỗi xác thực (Unauthorized) tại %s: %s", path, exception.getMessage());

        ErrorMessage errorMessage = new ErrorMessage(
                LocalDateTime.now(),
                Response.Status.UNAUTHORIZED.getStatusCode(),
                Response.Status.UNAUTHORIZED.getReasonPhrase(),
                "Yêu cầu xác thực tài khoản. Vui lòng đăng nhập để truy cập tài nguyên này.",
                path
        );

        return Response.status(Response.Status.UNAUTHORIZED)
                .type(MediaType.APPLICATION_JSON)
                .entity(errorMessage)
                .build();
    }
}
