package com.phong.it.repository;

import com.phong.it.entity.ProductImage;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ProductImageRepository implements PanacheRepository<ProductImage> {

    public List<ProductImage> findByProductId(Long productId) {
        return list("product.id", productId);
    }
}
