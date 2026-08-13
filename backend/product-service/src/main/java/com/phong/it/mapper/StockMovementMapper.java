package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.StockMovementRequestDTO;
import com.phong.it.dto.response.StockMovementResponseDTO;
import com.phong.it.entity.StockMovement;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StockMovementMapper {

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "variantName", source = "variant.name")
    StockMovementResponseDTO toDto(StockMovement stockMovement);

    @Mapping(target = "variant.id", source = "variantId")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    StockMovement toEntity(StockMovementRequestDTO dto);
}

