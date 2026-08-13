package com.phong.it.repository;

import com.phong.it.entity.Role;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RoleRepository implements PanacheRepository<Role> {
    
    public Role findByName(String name) {
        return find("name", name).firstResult();
    }
}
