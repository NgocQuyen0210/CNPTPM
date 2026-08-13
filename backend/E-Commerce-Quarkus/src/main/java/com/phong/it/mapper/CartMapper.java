package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.response.CartResponseDTO;
import com.phong.it.entity.Cart;

@Mapper(
    componentModel = "cdi", 
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {CartItemMapper.class}
)
public interface CartMapper {

    @Mapping(target = "userId", source = "user.id")
    CartResponseDTO toDto(Cart cart);
}

