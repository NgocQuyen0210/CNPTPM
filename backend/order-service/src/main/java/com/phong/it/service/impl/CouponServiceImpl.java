package com.phong.it.service.impl;

import com.phong.it.dto.request.CouponRequestDTO;
import com.phong.it.dto.response.CouponResponseDTO;
import com.phong.it.entity.Coupon;
import com.phong.it.entity.DiscountType;
import com.phong.it.mapper.CouponMapper;
import com.phong.it.repository.CouponRepository;
import com.phong.it.service.CouponService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CouponServiceImpl implements CouponService {

    @Inject
    CouponRepository couponRepository;

    @Inject
    CouponMapper couponMapper;

    @Override
    @Transactional
    public CouponResponseDTO create(CouponRequestDTO requestDTO) {
        if (couponRepository.findByCode(requestDTO.code()) != null) {
            throw new BadRequestException("Mã giảm giá đã tồn tại");
        }

        Coupon coupon = couponMapper.toEntity(requestDTO);
        try {
            coupon.setDiscountType(DiscountType.valueOf(requestDTO.discountType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Loại giảm giá không hợp lệ. Vui lòng chọn FIXED_AMOUNT hoặc PERCENTAGE");
        }
        
        coupon.setUsedCount(0);
        
        couponRepository.persist(coupon);
        return couponMapper.toDto(coupon);
    }

    @Override
    @Transactional
    public CouponResponseDTO update(Long id, CouponRequestDTO requestDTO) {
        Coupon coupon = couponRepository.findById(id);
        if (coupon == null) {
            throw new NotFoundException("Không tìm thấy mã giảm giá với ID: " + id);
        }

        if (!coupon.getCode().equals(requestDTO.code()) && couponRepository.findByCode(requestDTO.code()) != null) {
            throw new BadRequestException("Mã giảm giá đã tồn tại");
        }

        coupon.setCode(requestDTO.code());
        coupon.setDescription(requestDTO.description());
        try {
            coupon.setDiscountType(DiscountType.valueOf(requestDTO.discountType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Loại giảm giá không hợp lệ. Vui lòng chọn FIXED_AMOUNT hoặc PERCENTAGE");
        }
        coupon.setDiscountValue(requestDTO.discountValue());
        coupon.setMinOrderValue(requestDTO.minOrderValue());
        coupon.setMaxDiscountValue(requestDTO.maxDiscountValue());
        coupon.setStartDate(requestDTO.startDate());
        coupon.setEndDate(requestDTO.endDate());
        coupon.setUsageLimit(requestDTO.usageLimit());
        coupon.setIsActive(requestDTO.isActive());

        return couponMapper.toDto(coupon);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Coupon coupon = couponRepository.findById(id);
        if (coupon == null) {
            throw new NotFoundException("Không tìm thấy mã giảm giá với ID: " + id);
        }
        couponRepository.delete(coupon);
    }

    @Override
    public List<CouponResponseDTO> getAll() {
        return couponRepository.listAll().stream()
                .map(couponMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CouponResponseDTO getById(Long id) {
        Coupon coupon = couponRepository.findById(id);
        if (coupon == null) {
            throw new NotFoundException("Không tìm thấy mã giảm giá với ID: " + id);
        }
        return couponMapper.toDto(coupon);
    }

    @Override
    public CouponResponseDTO validateCoupon(String code, BigDecimal orderValue) {
        Coupon coupon = getValidCouponEntity(code, orderValue);
        return couponMapper.toDto(coupon);
    }

    @Override
    public CouponResponseDTO validateCoupon(String code, Double orderAmount) {
        if (orderAmount == null) {
            throw new BadRequestException("Giá trị đơn hàng không hợp lệ");
        }
        return validateCoupon(code, BigDecimal.valueOf(orderAmount));
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal orderValue) {
        Coupon coupon = getValidCouponEntity(code, orderValue);
        
        BigDecimal discount = BigDecimal.ZERO;

        if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = coupon.getDiscountValue();
        } else if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderValue.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"), RoundingMode.HALF_UP);
            
            // Áp dụng giới hạn mức giảm tối đa
            if (coupon.getMaxDiscountValue() != null && discount.compareTo(coupon.getMaxDiscountValue()) > 0) {
                discount = coupon.getMaxDiscountValue();
            }
        }

        // Không giảm quá giá trị đơn hàng
        if (discount.compareTo(orderValue) > 0) {
            discount = orderValue;
        }

        return discount;
    }

    @Override
    @Transactional
    public void updateUsageCount(String code) {
        Coupon coupon = couponRepository.findByCode(code);
        if (coupon != null) {
            coupon.setUsedCount((coupon.getUsedCount() != null ? coupon.getUsedCount() : 0) + 1);
        }
    }

    private Coupon getValidCouponEntity(String code, BigDecimal orderValue) {
        Coupon coupon = couponRepository.findByCode(code);
        if (coupon == null) {
            throw new BadRequestException("Mã giảm giá không tồn tại");
        }

        if (Boolean.FALSE.equals(coupon.isIsActive())) {
            throw new BadRequestException("Mã giảm giá này đã bị vô hiệu hóa");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Mã giảm giá này chưa đến thời gian áp dụng");
        }

        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá này đã hết hạn");
        }

        if (coupon.getUsageLimit() != null) {
            int usedCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            if (usedCount >= coupon.getUsageLimit()) {
                throw new BadRequestException("Mã giảm giá này đã hết lượt sử dụng");
            }
        }

        if (coupon.getMinOrderValue() != null && orderValue.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException("Giá trị đơn hàng chưa đạt mức tối thiểu để sử dụng mã này");
        }

        return coupon;
    }
}
