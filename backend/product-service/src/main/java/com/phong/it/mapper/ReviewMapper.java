package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.ReviewRequestDTO;
import com.phong.it.dto.response.ReviewResponseDTO;
import com.phong.it.entity.Review;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "productId", source = "product.id")
    ReviewResponseDTO toResponseDTO(Review review);

    @Mapping(target = "product.id", source = "productId")
    Review toEntity(ReviewRequestDTO dto);
}

