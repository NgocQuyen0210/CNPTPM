package com.phong.it.repository;

import com.phong.it.entity.Wishlist;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class WishlistRepository implements PanacheRepository<Wishlist> {

    public List<Wishlist> findByUserId(Long userId) {
        return list("user.id", userId);
    }

    public Wishlist findByUserIdAndProductId(Long userId, Long productId) {
        return find("user.id = ?1 and product.id = ?2", userId, productId).firstResult();
    }
}
