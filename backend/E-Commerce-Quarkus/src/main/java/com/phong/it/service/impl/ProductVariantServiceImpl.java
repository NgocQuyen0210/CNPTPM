package com.phong.it.service.impl;

import com.phong.it.dto.request.ProductVariantRequestDTO;
import com.phong.it.dto.response.ProductVariantResponseDTO;
import com.phong.it.entity.Product;
import com.phong.it.entity.ProductVariant;
import com.phong.it.mapper.ProductVariantMapper;
import com.phong.it.repository.ProductRepository;
import com.phong.it.repository.ProductVariantRepository;
import com.phong.it.service.ProductVariantService;
import io.quarkus.cache.CacheResult;
import io.quarkus.cache.CacheInvalidateAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductVariantServiceImpl implements ProductVariantService {

    @Inject
    ProductVariantRepository productVariantRepository;

    @Inject
    ProductRepository productRepository;

    @Inject
    ProductVariantMapper productVariantMapper;

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "product-variants")
    public ProductVariantResponseDTO create(ProductVariantRequestDTO requestDTO) {
        // Kiểm tra SKU duy nhất
        ProductVariant existingSku = productVariantRepository.findBySku(requestDTO.sku());
        if (existingSku != null) {
            throw new BadRequestException("SKU đã tồn tại: " + requestDTO.sku());
        }

        // Kiểm tra Product tồn tại
        Product product = productRepository.findById(requestDTO.productId());
        if (product == null) {
            throw new BadRequestException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
        }

        ProductVariant variant = productVariantMapper.toEntity(requestDTO);
        variant.setProduct(product);
        
        productVariantRepository.persist(variant);
        return productVariantMapper.toResponseDTO(variant);
    }

    @Override
    @CacheResult(cacheName = "product-variants")
    public ProductVariantResponseDTO getById(Long id) {
        ProductVariant variant = productVariantRepository.findById(id);
        if (variant == null) {
            throw new NotFoundException("Không tìm thấy biến thể với ID: " + id);
        }
        return productVariantMapper.toResponseDTO(variant);
    }

    @Override
    @CacheResult(cacheName = "product-variants")
    public List<ProductVariantResponseDTO> getAll() {
        return productVariantRepository.listAll().stream()
                .map(productVariantMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CacheResult(cacheName = "product-variants")
    public List<ProductVariantResponseDTO> getByProductId(Long productId) {
        return productVariantRepository.findByProductId(productId).stream()
                .map(productVariantMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "product-variants")
    public ProductVariantResponseDTO update(Long id, ProductVariantRequestDTO requestDTO) {
        ProductVariant variant = productVariantRepository.findById(id);
        if (variant == null) {
            throw new NotFoundException("Không tìm thấy biến thể với ID: " + id);
        }

        // Kiểm tra SKU duy nhất (cho phép giữ nguyên SKU cũ của chính nó)
        if (!variant.getSku().equals(requestDTO.sku())) {
            ProductVariant existingSku = productVariantRepository.findBySku(requestDTO.sku());
            if (existingSku != null) {
                throw new BadRequestException("SKU đã tồn tại: " + requestDTO.sku());
            }
        }

        // Kiểm tra Product tồn tại nếu thay đổi
        if (!variant.getProduct().getId().equals(requestDTO.productId())) {
            Product product = productRepository.findById(requestDTO.productId());
            if (product == null) {
                throw new BadRequestException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
            }
            variant.setProduct(product);
        }

        variant.setName(requestDTO.name());
        variant.setSku(requestDTO.sku());
        variant.setPrice(requestDTO.price());
        variant.setStockQuantity(requestDTO.stockQuantity());

        return productVariantMapper.toResponseDTO(variant);
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "product-variants")
    public void delete(Long id) {
        ProductVariant variant = productVariantRepository.findById(id);
        if (variant == null) {
            throw new NotFoundException("Không tìm thấy biến thể với ID: " + id);
        }

        // Kiểm tra tính toàn vẹn dữ liệu
        if (variant.getOrderItems() != null && !variant.getOrderItems().isEmpty()) {
            throw new BadRequestException("Không thể xóa biến thể đã nằm trong đơn hàng");
        }
        
        if (variant.getCartItems() != null && !variant.getCartItems().isEmpty()) {
            throw new BadRequestException("Không thể xóa biến thể đang nằm trong giỏ hàng");
        }

        productVariantRepository.delete(variant);
    }
}
