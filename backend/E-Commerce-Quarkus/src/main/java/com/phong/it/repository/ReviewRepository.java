package com.phong.it.repository;

import com.phong.it.entity.Review;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ReviewRepository implements PanacheRepository<Review> {

    public List<Review> findByProductId(Long productId) {
        return list("product.id", productId);
    }

    public List<Review> findByProductIdAndStatus(Long productId, Boolean status) {
        return list("product.id = ?1 and status = ?2", productId, status);
    }
}
