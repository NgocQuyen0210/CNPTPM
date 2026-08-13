package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.OrderItemRequestDTO;
import com.phong.it.dto.response.OrderItemResponseDTO;
import com.phong.it.entity.OrderItem;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "variantName", source = "variant.name")
    @Mapping(target = "productName", source = "variant.product.name")
    OrderItemResponseDTO toResponseDTO(OrderItem orderItem);

    @Mapping(target = "variant.id", source = "variantId")
    OrderItem toEntity(OrderItemRequestDTO dto);
}

