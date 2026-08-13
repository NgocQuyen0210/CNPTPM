package com.phong.it.service.impl;

import com.phong.it.dto.request.CategoryRequestDTO;
import com.phong.it.dto.response.CategoryResponseDTO;
import com.phong.it.entity.Category;
import com.phong.it.mapper.CategoryMapper;
import com.phong.it.repository.CategoryRepository;
import com.phong.it.service.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    CategoryMapper categoryMapper;

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "categories")
    public CategoryResponseDTO create(CategoryRequestDTO requestDTO) {
        Category category = categoryMapper.toEntity(requestDTO);

        if (requestDTO.parentId() != null) {
            Category parent = categoryRepository.findById(requestDTO.parentId());
            if (parent == null) {
                throw new BadRequestException("Không tìm thấy danh mục cha với ID: " + requestDTO.parentId());
            }
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        categoryRepository.persist(category);
        return categoryMapper.toDto(category);
    }

    @Override
    @CacheResult(cacheName = "categories")
    public CategoryResponseDTO getById(Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException("Không tìm thấy danh mục với ID: " + id);
        }
        return categoryMapper.toDto(category);
    }

    @Override
    @CacheResult(cacheName = "categories")
    public List<CategoryResponseDTO> getAll() {
        return categoryRepository.listAll().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @CacheResult(cacheName = "categories")
    public List<CategoryResponseDTO> getRootCategories() {
        return categoryRepository.findRootCategories().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "categories")
    public CategoryResponseDTO update(Long id, CategoryRequestDTO requestDTO) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException("Không tìm thấy danh mục với ID: " + id);
        }

        category.setName(requestDTO.name());
        category.setSlug(requestDTO.slug());
        category.setDescription(requestDTO.description());

        if (requestDTO.parentId() != null) {
            if (requestDTO.parentId().equals(id)) {
                throw new BadRequestException("Một danh mục không thể là cha của chính nó");
            }
            
            Category parent = categoryRepository.findById(requestDTO.parentId());
            if (parent == null) {
                throw new BadRequestException("Không tìm thấy danh mục cha với ID: " + requestDTO.parentId());
            }
            
            // Basic circular dependency check (checking immediate parent)
            if (parent.getParent() != null && parent.getParent().getId().equals(id)) {
                throw new BadRequestException("Phát hiện lỗi vòng lặp: danh mục cha đang là con của danh mục này");
            }
            
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return categoryMapper.toDto(category);
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "categories")
    public void delete(Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new NotFoundException("Không tìm thấy danh mục với ID: " + id);
        }

        // Validate before delete
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new BadRequestException("Không thể xóa danh mục đang chứa sản phẩm");
        }

        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new BadRequestException("Không thể xóa danh mục đang có danh mục con");
        }

        categoryRepository.delete(category);
    }
}
