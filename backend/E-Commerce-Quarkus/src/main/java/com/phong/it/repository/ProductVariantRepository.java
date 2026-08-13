package com.phong.it.repository;

import com.phong.it.entity.ProductVariant;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ProductVariantRepository implements PanacheRepository<ProductVariant> {

    public ProductVariant findBySku(String sku) {
        return find("sku", sku).firstResult();
    }

    public List<ProductVariant> findByProductId(Long productId) {
        return list("product.id", productId);
    }
}
