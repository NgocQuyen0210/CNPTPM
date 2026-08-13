package com.phong.it.exception;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

@Provider
public class FallbackExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(FallbackExceptionMapper.class);

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(Exception exception) {
        String path = uriInfo.getRequestUri().getPath();

        // Ghi lại toàn bộ log lỗi chi tiết kèm stack trace ở Backend
        LOG.errorf(exception, "Lỗi hệ thống nghiêm trọng chưa được phân loại tại %s", path);

        ErrorMessage errorMessage = new ErrorMessage(
                LocalDateTime.now(),
                Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                Response.Status.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Đã xảy ra lỗi hệ thống nghiêm trọng, vui lòng liên hệ quản trị viên.",
                path
        );

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .type(MediaType.APPLICATION_JSON)
                .entity(errorMessage)
                .build();
    }
}
