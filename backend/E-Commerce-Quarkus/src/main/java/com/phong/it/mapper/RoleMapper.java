package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.RoleRequestDTO;
import com.phong.it.dto.response.RoleResponseDTO;
import com.phong.it.entity.Role;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoleMapper {

    RoleResponseDTO toResponseDTO(Role role);

    Role toEntity(RoleRequestDTO dto);
}

