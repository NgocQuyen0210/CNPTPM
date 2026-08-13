package com.phong.it.service.impl;

import com.phong.it.dto.request.StockMovementRequestDTO;
import com.phong.it.dto.response.StockMovementResponseDTO;
import com.phong.it.entity.MovementType;
import com.phong.it.entity.ProductVariant;
import com.phong.it.entity.StockMovement;
import com.phong.it.mapper.StockMovementMapper;
import com.phong.it.repository.ProductVariantRepository;
import com.phong.it.repository.StockMovementRepository;
import com.phong.it.service.StockMovementService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class StockMovementServiceImpl implements StockMovementService {

    @Inject
    StockMovementRepository stockMovementRepository;

    @Inject
    ProductVariantRepository productVariantRepository;

    @Inject
    StockMovementMapper stockMovementMapper;

    @Override
    @Transactional
    public StockMovementResponseDTO create(StockMovementRequestDTO requestDTO) {
        // Bước 1: Tìm ProductVariant theo variantId
        ProductVariant variant = productVariantRepository.findById(requestDTO.variantId());
        if (variant == null) {
            throw new BadRequestException("Không tìm thấy biến thể sản phẩm với ID: " + requestDTO.variantId());
        }

        int currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        int requestedQuantity = requestDTO.quantity() != null ? requestDTO.quantity() : 0;

        if (requestedQuantity <= 0) {
            throw new BadRequestException("Số lượng biến động kho phải lớn hơn 0");
        }

        // Bước 2: Tính toán lại stockQuantity
        if (requestDTO.movementType() == MovementType.IN || requestDTO.movementType() == MovementType.RETURN) {
            currentStock += requestedQuantity;
        } else if (requestDTO.movementType() == MovementType.OUT) {
            if (currentStock < requestedQuantity) {
                throw new BadRequestException("Số lượng tồn kho không đủ để xuất kho. Tồn kho hiện tại: " + currentStock);
            }
            currentStock -= requestedQuantity;
        } else if (requestDTO.movementType() == MovementType.ADJUSTMENT) {
            // Trong trường hợp ADJUSTMENT, quantity có thể là số lượng mới thay vì lượng thay đổi
            // Tuy nhiên dựa theo thiết kế (IN/OUT), ta có thể linh hoạt xử lý hoặc yêu cầu làm rõ thêm.
            // Để đơn giản, ta trừ đi nếu âm, cộng nếu dương. Nhưng Request yêu cầu số lượng luôn dương.
            // Ta có thể giả định điều chỉnh cộng thêm vào.
            currentStock += requestedQuantity;
        }

        variant.setStockQuantity(currentStock);

        // Bước 3: Lưu StockMovement và cập nhật lại ProductVariant
        StockMovement stockMovement = stockMovementMapper.toEntity(requestDTO);
        stockMovement.setVariant(variant);

        // ProductVariant tự động cập nhật bởi Hibernate do đang ở trạng thái managed trong Transaction
        stockMovementRepository.persist(stockMovement);

        return stockMovementMapper.toDto(stockMovement);
    }

    @Override
    public StockMovementResponseDTO getById(Long id) {
        StockMovement stockMovement = stockMovementRepository.findById(id);
        if (stockMovement == null) {
            throw new NotFoundException("Không tìm thấy biến động kho với ID: " + id);
        }
        return stockMovementMapper.toDto(stockMovement);
    }

    @Override
    public List<StockMovementResponseDTO> getAll() {
        return stockMovementRepository.listAll().stream()
                .map(stockMovementMapper::toDto)
                .collect(Collectors.toList());
    }
}
