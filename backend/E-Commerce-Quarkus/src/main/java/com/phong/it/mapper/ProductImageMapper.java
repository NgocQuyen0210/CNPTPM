package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.ProductImageRequestDTO;
import com.phong.it.dto.response.ProductImageResponseDTO;
import com.phong.it.entity.ProductImage;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductImageMapper {

    @Mapping(target = "productId", source = "product.id")
    ProductImageResponseDTO toResponseDTO(ProductImage productImage);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product.id", source = "productId")
    ProductImage toEntity(ProductImageRequestDTO dto);
}

