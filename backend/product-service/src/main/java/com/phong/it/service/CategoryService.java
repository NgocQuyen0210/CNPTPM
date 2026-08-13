package com.phong.it.service;

import com.phong.it.dto.request.CategoryRequestDTO;
import com.phong.it.dto.response.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO requestDTO);
    CategoryResponseDTO getById(Long id);
    List<CategoryResponseDTO> getAll();
    List<CategoryResponseDTO> getRootCategories();
    CategoryResponseDTO update(Long id, CategoryRequestDTO requestDTO);
    void delete(Long id);
}
