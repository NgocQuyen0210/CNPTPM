package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.SupplierRequestDTO;
import com.phong.it.dto.response.SupplierResponseDTO;
import com.phong.it.entity.Supplier;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SupplierMapper {

    SupplierResponseDTO toDto(Supplier supplier);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "products", ignore = true)
    Supplier toEntity(SupplierRequestDTO dto);
}

