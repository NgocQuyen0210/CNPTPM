package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.ProductVariantRequestDTO;
import com.phong.it.dto.response.ProductVariantResponseDTO;
import com.phong.it.entity.ProductVariant;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductVariantMapper {

    @Mapping(target = "productId", source = "product.id")
    ProductVariantResponseDTO toResponseDTO(ProductVariant productVariant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "stockMovements", ignore = true)
    ProductVariant toEntity(ProductVariantRequestDTO dto);
}

