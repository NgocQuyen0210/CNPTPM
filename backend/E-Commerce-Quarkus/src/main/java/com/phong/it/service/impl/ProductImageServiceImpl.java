package com.phong.it.service.impl;

import com.phong.it.dto.request.ProductImageRequestDTO;
import com.phong.it.dto.response.ProductImageResponseDTO;
import com.phong.it.entity.Product;
import com.phong.it.entity.ProductImage;
import com.phong.it.mapper.ProductImageMapper;
import com.phong.it.repository.ProductImageRepository;
import com.phong.it.repository.ProductRepository;
import com.phong.it.service.ProductImageService;
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
public class ProductImageServiceImpl implements ProductImageService {

    @Inject
    ProductImageRepository productImageRepository;

    @Inject
    ProductRepository productRepository;

    @Inject
    ProductImageMapper productImageMapper;

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "product-images")
    public ProductImageResponseDTO create(ProductImageRequestDTO requestDTO) {
        Product product = productRepository.findById(requestDTO.productId());
        if (product == null) {
            throw new BadRequestException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
        }

        // Logic đặc biệt: Nếu ảnh này được chọn làm ảnh chính
        if (Boolean.TRUE.equals(requestDTO.isMain())) {
            unsetOtherMainImages(requestDTO.productId(), null);
        }

        ProductImage image = productImageMapper.toEntity(requestDTO);
        image.setProduct(product);

        productImageRepository.persist(image);
        return productImageMapper.toResponseDTO(image);
    }

    @Override
    @CacheResult(cacheName = "product-images")
    public ProductImageResponseDTO getById(Long id) {
        ProductImage image = productImageRepository.findById(id);
        if (image == null) {
            throw new NotFoundException("Không tìm thấy ảnh với ID: " + id);
        }
        return productImageMapper.toResponseDTO(image);
    }

    @Override
    @CacheResult(cacheName = "product-images")
    public List<ProductImageResponseDTO> getAll() {
        return productImageRepository.listAll().stream()
                .map(productImageMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CacheResult(cacheName = "product-images")
    public List<ProductImageResponseDTO> getByProductId(Long productId) {
        return productImageRepository.findByProductId(productId).stream()
                .map(productImageMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "product-images")
    public ProductImageResponseDTO update(Long id, ProductImageRequestDTO requestDTO) {
        ProductImage image = productImageRepository.findById(id);
        if (image == null) {
            throw new NotFoundException("Không tìm thấy ảnh với ID: " + id);
        }

        // Kiểm tra Product tồn tại nếu thay đổi
        if (!image.getProduct().getId().equals(requestDTO.productId())) {
            Product product = productRepository.findById(requestDTO.productId());
            if (product == null) {
                throw new BadRequestException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
            }
            image.setProduct(product);
        }

        // Logic đặc biệt: Nếu ảnh này được đánh dấu làm ảnh chính
        if (Boolean.TRUE.equals(requestDTO.isMain())) {
            unsetOtherMainImages(requestDTO.productId(), id);
        }

        image.setImageUrl(requestDTO.imageUrl());
        image.setIsMain(requestDTO.isMain());
        image.setSortOrder(requestDTO.sortOrder());

        return productImageMapper.toResponseDTO(image);
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "product-images")
    public void delete(Long id) {
        ProductImage image = productImageRepository.findById(id);
        if (image == null) {
            throw new NotFoundException("Không tìm thấy ảnh với ID: " + id);
        }

        productImageRepository.delete(image);
    }

    /**
     * Hàm hỗ trợ: Hủy cờ isMain của tất cả các ảnh khác thuộc cùng một sản phẩm
     */
    private void unsetOtherMainImages(Long productId, Long excludeImageId) {
        List<ProductImage> otherImages = productImageRepository.findByProductId(productId);
        for (ProductImage img : otherImages) {
            if (excludeImageId == null || !img.getId().equals(excludeImageId)) {
                img.setIsMain(false);
            }
        }
    }
}
