package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.RefreshRequestDTO;
import com.phong.it.dto.response.TokenResponseDTO;
import com.phong.it.entity.RefreshToken;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

    TokenResponseDTO toResponseDTO(RefreshToken refreshToken);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    RefreshToken toEntity(RefreshRequestDTO dto);
}

