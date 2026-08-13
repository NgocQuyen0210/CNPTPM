package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.CouponRequestDTO;
import com.phong.it.dto.response.CouponResponseDTO;
import com.phong.it.entity.Coupon;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CouponMapper {

    CouponResponseDTO toDto(Coupon coupon);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    Coupon toEntity(CouponRequestDTO dto);
}

