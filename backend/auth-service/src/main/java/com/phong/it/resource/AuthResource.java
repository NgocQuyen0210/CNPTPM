package com.phong.it.resource;

import com.phong.it.dto.request.LoginRequestDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.service.UserService;
import io.smallrye.jwt.build.Jwt;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Duration;
import java.util.Map;

@Path("/api/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    UserService userService;

    @POST
    @Path("/login")
    @PermitAll
    public Response login(@Valid LoginRequestDTO requestDTO) {
        // Thực hiện đăng nhập thực tế bằng Service và MySQL + Bcrypt
        UserResponseDTO user = userService.login(requestDTO.username(), requestDTO.password());

        // Sinh JWT Token đồng bộ định dạng Subject và nhóm phân quyền Roles từ DB
        String token = Jwt.issuer("https://ecommerce.phong.com/issuer")
                .upn(user.username())
                .subject(String.valueOf(user.id())) // Sửa subject thành dạng chuỗi của ID để tránh NumberFormatException
                .claim("userId", user.id())
                .groups(user.roles()) // Lấy danh sách Roles thực tế của người dùng từ DB
                .expiresIn(Duration.ofHours(1))
                .sign();

        return Response.ok(ApiResponse.success(Map.of("token", token), "Đăng nhập thành công")).build();
    }
}
