package com.phong.it.service;

import com.phong.it.dto.request.ProductRequestDTO;
import com.phong.it.dto.response.PageResponseDTO;
import com.phong.it.dto.response.ProductResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    ProductResponseDTO create(ProductRequestDTO requestDTO);
    ProductResponseDTO getById(Long id);
    List<ProductResponseDTO> getAll();
    ProductResponseDTO update(Long id, ProductRequestDTO requestDTO);
    void delete(Long id);
    PageResponseDTO<ProductResponseDTO> findWithFilters(
    int page, int size, String keyword, Long categoryId, 
    String brand, BigDecimal minPrice, BigDecimal maxPrice, String sortBy);
}
