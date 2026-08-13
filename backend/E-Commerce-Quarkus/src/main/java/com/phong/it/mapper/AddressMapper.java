package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.AddressRequestDTO;
import com.phong.it.dto.response.AddressResponseDTO;
import com.phong.it.entity.Address;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AddressMapper {

    @Mapping(target = "userId", source = "user.id")
    AddressResponseDTO toDto(Address address);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    Address toEntity(AddressRequestDTO dto);
}

