package com.phong.it.dto.response;

import java.util.Set;

public record UserResponseDTO(
    Long id,
    String username,
    String email,
    String fullName,
    Set<String> roles
) {
}
