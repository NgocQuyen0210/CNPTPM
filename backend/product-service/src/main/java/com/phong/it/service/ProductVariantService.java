package com.phong.it.service;

import com.phong.it.dto.request.ProductVariantRequestDTO;
import com.phong.it.dto.response.ProductVariantResponseDTO;

import java.util.List;

public interface ProductVariantService {
    ProductVariantResponseDTO create(ProductVariantRequestDTO requestDTO);
    ProductVariantResponseDTO getById(Long id);
    List<ProductVariantResponseDTO> getAll();
    List<ProductVariantResponseDTO> getByProductId(Long productId);
    ProductVariantResponseDTO update(Long id, ProductVariantRequestDTO requestDTO);
    void delete(Long id);
}
