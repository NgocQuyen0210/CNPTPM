package com.phong.it.service;

import com.phong.it.dto.request.OrderRequestDTO;
import com.phong.it.dto.response.OrderResponseDTO;
import com.phong.it.entity.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponseDTO placeOrder(Long userId, OrderRequestDTO requestDTO);
    List<OrderResponseDTO> getOrderHistory(Long userId);
    OrderResponseDTO getOrderById(Long id);
    OrderResponseDTO updateStatus(Long id, OrderStatus status);
}
