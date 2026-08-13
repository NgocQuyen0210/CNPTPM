package com.phong.it.repository;

import com.phong.it.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Repository thao tác với cơ sở dữ liệu cho User Entity.
 */
@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
    
    // Tìm kiếm người dùng theo username
    public User findByUsername(String username) {
        return find("username", username).firstResult();
    }
    
    // Tìm kiếm người dùng theo email
    public User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
