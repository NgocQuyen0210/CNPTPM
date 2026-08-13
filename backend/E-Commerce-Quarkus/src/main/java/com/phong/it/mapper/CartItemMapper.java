package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.response.CartItemResponseDTO;
import com.phong.it.entity.CartItem;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartItemMapper {

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "variantName", source = "variant.name")
    @Mapping(target = "price", source = "variant.price")
    @Mapping(target = "productName", source = "variant.product.name")
    @Mapping(target = "image", source = "variant.product.featuredImage")
    CartItemResponseDTO toDto(CartItem cartItem);
}

