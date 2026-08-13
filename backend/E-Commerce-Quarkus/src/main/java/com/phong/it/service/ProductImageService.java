package com.phong.it.service;

import com.phong.it.dto.request.ProductImageRequestDTO;
import com.phong.it.dto.response.ProductImageResponseDTO;

import java.util.List;

public interface ProductImageService {
    ProductImageResponseDTO create(ProductImageRequestDTO requestDTO);
    ProductImageResponseDTO getById(Long id);
    List<ProductImageResponseDTO> getAll();
    List<ProductImageResponseDTO> getByProductId(Long productId);
    ProductImageResponseDTO update(Long id, ProductImageRequestDTO requestDTO);
    void delete(Long id);
}
