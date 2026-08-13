package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.WishlistRequestDTO;
import com.phong.it.dto.response.WishlistResponseDTO;
import com.phong.it.entity.Wishlist;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WishlistMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productPrice", source = "product.price")
    @Mapping(target = "productImage", source = "product.featuredImage")
    WishlistResponseDTO toResponseDTO(Wishlist wishlist);

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    Wishlist toEntity(WishlistRequestDTO dto);
}

