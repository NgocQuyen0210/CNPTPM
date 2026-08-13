package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.WishlistRequestDTO;
import com.phong.it.dto.response.WishlistResponseDTO;
import com.phong.it.entity.Wishlist;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WishlistMapper {

    @Mapping(target = "id", ignore = true)
    Wishlist toEntity(WishlistRequestDTO dto);
}

