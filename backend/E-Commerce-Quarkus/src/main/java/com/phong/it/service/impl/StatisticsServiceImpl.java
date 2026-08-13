package com.phong.it.service.impl;

import com.phong.it.dto.response.CategoryRevenueDTO;
import com.phong.it.dto.response.RevenueOverTimeDTO;
import com.phong.it.dto.response.StatisticsOverviewDTO;
import com.phong.it.dto.response.TopProductDTO;
import com.phong.it.entity.OrderStatus;
import com.phong.it.service.StatisticsService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class StatisticsServiceImpl implements StatisticsService {

    @Inject
    EntityManager entityManager;

    @Override
    public StatisticsOverviewDTO getOverview() {
        BigDecimal totalRevenue = entityManager.createQuery(
                "SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = :status", BigDecimal.class)
                .setParameter("status", OrderStatus.DELIVERED)
                .getSingleResult();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        Long totalOrdersResult = entityManager.createQuery(
                "SELECT COUNT(o) FROM Order o", Long.class)
                .getSingleResult();
        long totalOrders = totalOrdersResult != null ? totalOrdersResult : 0L;

        Long totalProductsSoldResult = entityManager.createQuery(
                "SELECT SUM(i.quantity) FROM OrderItem i WHERE i.order.status = :status", Long.class)
                .setParameter("status", OrderStatus.DELIVERED)
                .getSingleResult();
        long totalProductsSold = totalProductsSoldResult != null ? totalProductsSoldResult : 0L;

        Long totalUsersResult = entityManager.createQuery(
                "SELECT COUNT(u) FROM User u", Long.class)
                .getSingleResult();
        long totalUsers = totalUsersResult != null ? totalUsersResult : 0L;

        return new StatisticsOverviewDTO(totalRevenue, totalOrders, totalProductsSold, totalUsers);
    }

    @Override
    public List<RevenueOverTimeDTO> getRevenueOverTime(String interval) {
        String format = "month".equalsIgnoreCase(interval) ? "%Y-%m" : "%Y-%m-%d";

        List<Object[]> rows = entityManager.createQuery(
                "SELECT FUNCTION('date_format', o.createdAt, :format) as period, SUM(o.totalPrice), COUNT(o) " +
                "FROM Order o " +
                "WHERE o.status = :status " +
                "GROUP BY FUNCTION('date_format', o.createdAt, :format) " +
                "ORDER BY period ASC", Object[].class)
                .setParameter("format", format)
                .setParameter("status", OrderStatus.DELIVERED)
                .getResultList();

        return rows.stream().map(row -> new RevenueOverTimeDTO(
                (String) row[0],
                row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO,
                row[2] != null ? (Long) row[2] : 0L
        )).collect(Collectors.toList());
    }

    @Override
    public List<TopProductDTO> getTopSellingProducts(int limit) {
        List<Object[]> rows = entityManager.createQuery(
                "SELECT p.id, p.name, SUM(i.quantity), SUM(i.price * i.quantity) " +
                "FROM OrderItem i JOIN i.variant v JOIN v.product p " +
                "WHERE i.order.status = :status " +
                "GROUP BY p.id, p.name " +
                "ORDER BY SUM(i.quantity) DESC", Object[].class)
                .setParameter("status", OrderStatus.DELIVERED)
                .setMaxResults(limit)
                .getResultList();

        return rows.stream().map(row -> new TopProductDTO(
                (Long) row[0],
                (String) row[1],
                row[2] != null ? (Long) row[2] : 0L,
                row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }

    @Override
    public List<CategoryRevenueDTO> getRevenueByCategory() {
        List<Object[]> rows = entityManager.createQuery(
                "SELECT c.id, c.name, SUM(i.price * i.quantity) " +
                "FROM OrderItem i JOIN i.variant v JOIN v.product p JOIN p.category c " +
                "WHERE i.order.status = :status " +
                "GROUP BY c.id, c.name " +
                "ORDER BY SUM(i.price * i.quantity) DESC", Object[].class)
                .setParameter("status", OrderStatus.DELIVERED)
                .getResultList();

        return rows.stream().map(row -> new CategoryRevenueDTO(
                (Long) row[0],
                (String) row[1],
                row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }
}
