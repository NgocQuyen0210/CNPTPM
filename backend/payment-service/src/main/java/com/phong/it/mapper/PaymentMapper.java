package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import jakarta.enterprise.context.ApplicationScoped;

import com.phong.it.dto.request.PaymentRequestDTO;
import com.phong.it.dto.response.PaymentResponseDTO;
import com.phong.it.entity.Payment;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
@ApplicationScoped
public interface PaymentMapper {

    PaymentResponseDTO toDto(Payment payment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Payment toEntity(PaymentRequestDTO dto);
}



