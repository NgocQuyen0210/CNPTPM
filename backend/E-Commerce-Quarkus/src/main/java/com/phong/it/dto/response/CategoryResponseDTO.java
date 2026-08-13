package com.phong.it.dto.response;

import java.util.List;

public record CategoryResponseDTO(
    Long id,
    String name,
    String slug,
    String description,
    Long parentId,
    String parentName,
    List<Long> childrenIds
) {
}
