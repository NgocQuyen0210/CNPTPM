package com.phong.it.repository;

import java.math.BigDecimal;
import java.util.Map;

import com.phong.it.entity.Product;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {

    public PanacheQuery<Product> findWithFilters(
        String keyword, Long categoryId, String brand, 
            BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
        StringBuilder queryBuilder = new StringBuilder("1=1");
        Map<String, Object> params = new java.util.HashMap<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            queryBuilder.append(" AND (lower(name) LIKE :keyword OR lower(brand) LIKE :keyword OR lower(summary) LIKE :keyword)");
            params.put("keyword", "%" + keyword.toLowerCase().trim() + "%");
        }
        if (categoryId != null) {
            queryBuilder.append(" AND category.id = :categoryId");
            params.put("categoryId", categoryId);
        }
        if (brand != null && !brand.trim().isEmpty()) {
            queryBuilder.append(" AND lower(brand) = :brand");
            params.put("brand", brand.toLowerCase().trim());
        }
        if (minPrice != null) {
            queryBuilder.append(" AND price >= :minPrice");
            params.put("minPrice", minPrice);
        }
        if (maxPrice != null) {
            queryBuilder.append(" AND price <= :maxPrice");
            params.put("maxPrice", maxPrice);
        }
        // Xử lý sắp xếp (Sorting)
        String sortQuery = "";
        if (sortBy != null) {
            sortQuery = switch (sortBy) {
                case "price_asc" -> " ORDER BY price ASC";
                case "price_desc" -> " ORDER BY price DESC";
                case "name_asc" -> " ORDER BY name ASC";
                case "name_desc" -> " ORDER BY name DESC";
                default -> " ORDER BY id DESC";
            };
        } else {
            sortQuery = " ORDER BY id DESC";
        }
        return find(queryBuilder.toString() + sortQuery, params);
    }
}
