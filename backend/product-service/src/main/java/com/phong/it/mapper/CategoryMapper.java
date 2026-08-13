package com.phong.it.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.CategoryRequestDTO;
import com.phong.it.dto.response.CategoryResponseDTO;
import com.phong.it.entity.Category;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    @Mapping(target = "childrenIds", expression = "java(mapChildren(category.getChildren()))")
    CategoryResponseDTO toDto(Category category);

    @Mapping(target = "parent.id", source = "parentId")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "products", ignore = true)
    Category toEntity(CategoryRequestDTO dto);

    // HÃ m há»— trá»£ map danh sÃ¡ch category con sang list cÃ¡c ID
    default List<Long> mapChildren(List<Category> children) {
        if (children == null || children.isEmpty()) {
            return Collections.emptyList();
        }
        return children.stream()
                .map(Category::getId)
                .collect(Collectors.toList());
    }
}

