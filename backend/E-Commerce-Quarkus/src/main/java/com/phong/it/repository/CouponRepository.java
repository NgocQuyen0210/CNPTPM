package com.phong.it.repository;

import com.phong.it.entity.Coupon;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CouponRepository implements PanacheRepository<Coupon> {
    public Coupon findByCode(String code) {
        return find("code", code).firstResult();
    }
}
