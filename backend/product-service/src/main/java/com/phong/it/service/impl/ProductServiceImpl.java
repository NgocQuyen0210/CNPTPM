package com.phong.it.service.impl;

import com.phong.it.dto.request.ProductRequestDTO;
import com.phong.it.dto.response.PageResponseDTO;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.entity.Category;
import com.phong.it.entity.Product;
import com.phong.it.entity.Supplier;
import com.phong.it.mapper.ProductMapper;
import com.phong.it.repository.ProductRepository;
import com.phong.it.service.ProductService;
import io.quarkus.cache.CacheResult;
import io.quarkus.cache.CacheInvalidateAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.BadRequestException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductServiceImpl implements ProductService {

    @Inject
    ProductRepository productRepository;

    @Inject
    ProductMapper productMapper;

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "products")
    public ProductResponseDTO create(ProductRequestDTO requestDTO) {
        Product product = productMapper.toEntity(requestDTO);
        if (product.getStatus() == null) {
            product.setStatus("SELLING");
        }

        // Tải danh mục (Category) nếu có
        if (requestDTO.categoryId() != null) {
            Category category = Category.findById(requestDTO.categoryId());
            if (category == null) {
                throw new BadRequestException("Không tìm thấy danh mục với ID: " + requestDTO.categoryId());
            }
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        // Tải nhà cung cấp (Supplier) nếu có
        if (requestDTO.supplierId() != null) {
            Supplier supplier = Supplier.findById(requestDTO.supplierId());
            if (supplier == null) {
                throw new BadRequestException("Không tìm thấy nhà cung cấp với ID: " + requestDTO.supplierId());
            }
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }

        // Đảm bảo các biến thể và hình ảnh được thiết lập tham chiếu quay lại Product
        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setProduct(product));
        }
        if (product.getImages() != null) {
            product.getImages().forEach(image -> image.setProduct(product));
        }

        productRepository.persist(product);
        return productMapper.toResponseDTO(product);
    }

    @Override
    @CacheResult(cacheName = "products")
    public ProductResponseDTO getById(Long id) {
        Product product = productRepository.findById(id);
        if (product == null) {
            throw new NotFoundException("Không tìm thấy sản phẩm với ID: " + id);
        }
        return productMapper.toResponseDTO(product);
    }

    @Override
    @CacheResult(cacheName = "products")
    public List<ProductResponseDTO> getAll() {
        return productRepository.listAll().stream()
                .map(productMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "products")
    public ProductResponseDTO update(Long id, ProductRequestDTO requestDTO) {
        Product product = productRepository.findById(id);
        if (product == null) {
            throw new NotFoundException("Không tìm thấy sản phẩm với ID: " + id);
        }

        // Ánh xạ các trường (có thể dùng @MappingTarget của MapStruct, ở đây cập nhật thủ công)
        product.setName(requestDTO.name());
        product.setSlug(requestDTO.slug());
        product.setSummary(requestDTO.summary());
        product.setContent(requestDTO.content());
        product.setBrand(requestDTO.brand());
        product.setPrice(requestDTO.price());
        product.setFeaturedImage(requestDTO.featuredImage());
        if (requestDTO.status() != null) {
            product.setStatus(requestDTO.status());
        }

        if (requestDTO.categoryId() != null) {
            Category category = Category.findById(requestDTO.categoryId());
            if (category == null) {
                throw new BadRequestException("Không tìm thấy danh mục với ID: " + requestDTO.categoryId());
            }
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (requestDTO.supplierId() != null) {
            Supplier supplier = Supplier.findById(requestDTO.supplierId());
            if (supplier == null) {
                throw new BadRequestException("Không tìm thấy nhà cung cấp với ID: " + requestDTO.supplierId());
            }
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }

        // Đảm bảo duy trì tham chiếu quay lại nếu các biến thể/hình ảnh được cập nhật ở đây trong tương lai
        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setProduct(product));
        }
        if (product.getImages() != null) {
            product.getImages().forEach(image -> image.setProduct(product));
        }

        return productMapper.toResponseDTO(product);
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "products")
    public void delete(Long id) {
        boolean deleted = productRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("Không tìm thấy sản phẩm với ID: " + id);
        }
    }

    @Override
    @CacheResult(cacheName = "products")
    public PageResponseDTO<ProductResponseDTO> findWithFilters(
        int page, int size, String keyword, Long categoryId, 
        String brand, BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
        
        var query = productRepository.findWithFilters(keyword, categoryId, brand, minPrice, maxPrice, sortBy);
        
        var panachePage = query.page(page, size);
        
        List<ProductResponseDTO> content = panachePage.list().stream()
                .map(productMapper::toResponseDTO)
                .collect(Collectors.toList());

        return new PageResponseDTO<>(
                content,
                page,
                size,
                query.count(),         
                panachePage.pageCount(), 
                page >= panachePage.pageCount() - 1 // Có phải trang cuối không
        );
    }
}
