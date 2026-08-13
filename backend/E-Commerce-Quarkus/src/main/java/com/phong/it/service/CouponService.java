package com.phong.it.service;

import com.phong.it.dto.request.CouponRequestDTO;
import com.phong.it.dto.response.CouponResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface CouponService {
    CouponResponseDTO create(CouponRequestDTO requestDTO);
    CouponResponseDTO update(Long id, CouponRequestDTO requestDTO);
    void delete(Long id);
    List<CouponResponseDTO> getAll();
    CouponResponseDTO getById(Long id);
    CouponResponseDTO validateCoupon(String code, BigDecimal orderValue);
    CouponResponseDTO validateCoupon(String code, Double orderAmount);
    BigDecimal calculateDiscount(String code, BigDecimal orderValue);
    void updateUsageCount(String code);
}
