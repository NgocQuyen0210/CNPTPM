package com.phong.it.exception;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Provider
public class ConstraintViolationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    private static final Logger LOG = Logger.getLogger(ConstraintViolationExceptionMapper.class);

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        String path = uriInfo.getRequestUri().getPath();

        // Ghép nối các vi phạm kiểm định thành thông báo chi tiết
        String message = exception.getConstraintViolations().stream()
                .map(violation -> {
                    String fieldName = getFieldName(violation.getPropertyPath());
                    return fieldName + ": " + violation.getMessage();
                })
                .collect(Collectors.joining("; "));

        LOG.warnf("Lỗi dữ liệu đầu vào (Validation Error) tại %s: %s", path, message);

        ErrorMessage errorMessage = new ErrorMessage(
                LocalDateTime.now(),
                Response.Status.BAD_REQUEST.getStatusCode(),
                "Validation Error",
                message,
                path
        );

        return Response.status(Response.Status.BAD_REQUEST)
                .type(MediaType.APPLICATION_JSON)
                .entity(errorMessage)
                .build();
    }

    private String getFieldName(Path propertyPath) {
        String name = "";
        for (Path.Node node : propertyPath) {
            name = node.getName();
        }
        return name;
    }
}
