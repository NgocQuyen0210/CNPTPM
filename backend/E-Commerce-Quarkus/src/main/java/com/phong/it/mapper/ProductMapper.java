package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.ProductRequestDTO;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.entity.Product;

@Mapper(
    componentModel = "cdi", 
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {ProductImageMapper.class, ProductVariantMapper.class}
)
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.name")
    ProductResponseDTO toResponseDTO(Product product);

    @Mapping(target = "category.id", source = "categoryId")
    @Mapping(target = "supplier.id", source = "supplierId")
    Product toEntity(ProductRequestDTO dto);
}

