package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.OrderRequestDTO;
import com.phong.it.dto.response.OrderResponseDTO;
import com.phong.it.entity.Order;

@Mapper(
    componentModel = "cdi", 
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface OrderMapper {

    OrderResponseDTO toResponseDTO(Order order);

    Order toEntity(OrderRequestDTO dto);
}

