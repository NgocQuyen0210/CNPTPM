package com.phong.it.repository;

import com.phong.it.entity.Cart;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CartRepository implements PanacheRepository<Cart> {
    public Cart findByUserId(Long userId) {
        return find("user.id", userId).firstResult();
    }
}
