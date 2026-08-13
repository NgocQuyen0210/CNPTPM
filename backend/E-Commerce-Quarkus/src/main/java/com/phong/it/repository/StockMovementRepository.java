package com.phong.it.repository;

import com.phong.it.entity.StockMovement;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class StockMovementRepository implements PanacheRepository<StockMovement> {
}
