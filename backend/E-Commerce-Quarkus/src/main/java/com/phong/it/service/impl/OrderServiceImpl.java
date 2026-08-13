package com.phong.it.service.impl;

import com.phong.it.dto.request.OrderRequestDTO;
import com.phong.it.dto.request.StockMovementRequestDTO;
import com.phong.it.dto.response.OrderResponseDTO;
import com.phong.it.entity.*;
import com.phong.it.mapper.OrderMapper;
import com.phong.it.repository.CartRepository;
import com.phong.it.repository.CouponRepository;
import com.phong.it.repository.OrderRepository;
import com.phong.it.repository.UserRepository;
import com.phong.it.service.CouponService;
import com.phong.it.service.OrderService;
import com.phong.it.service.StockMovementService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class OrderServiceImpl implements OrderService {

    @Inject
    OrderRepository orderRepository;

    @Inject
    CartRepository cartRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    StockMovementService stockMovementService;

    @Inject
    OrderMapper orderMapper;

    @Inject
    CouponService couponService;

    @Inject
    CouponRepository couponRepository;

    @Override
    @Transactional
    public OrderResponseDTO placeOrder(Long userId, OrderRequestDTO requestDTO) {
        // Lấy giỏ hàng của user
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống");
        }

        User user = userRepository.findById(userId);
        if (user == null) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        // Tạo đơn hàng từ DTO
        Order order = orderMapper.toEntity(requestDTO);
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderItems(new ArrayList<>());

        BigDecimal totalPrice = BigDecimal.ZERO;

        // Xử lý từng sản phẩm trong giỏ hàng
        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            int quantity = cartItem.getQuantity();

            // Tạo OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(variant.getPrice()); // Giá tại thời điểm đặt hàng

            order.getOrderItems().add(orderItem);

            // Tính tổng tiền
            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(quantity));
            totalPrice = totalPrice.add(itemTotal);

            // Trừ kho và tạo StockMovement OUT
            StockMovementRequestDTO movementDTO = new StockMovementRequestDTO(
                    variant.getId(),
                    quantity,
                    MovementType.OUT,
                    "Xuất kho cho đơn hàng mới của user " + userId
            );
            stockMovementService.create(movementDTO);
        }

        // Xử lý mã giảm giá (Coupon) thực tế
        String couponCode = requestDTO.couponCode();
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            // Xác thực Coupon (sẽ tự động ném ngoại lệ nếu không hợp lệ)
            couponService.validateCoupon(couponCode, totalPrice);

            // Tính số tiền được giảm giá
            BigDecimal discount = couponService.calculateDiscount(couponCode, totalPrice);

            // Lấy Coupon entity để lưu vào Đơn hàng
            Coupon coupon = couponRepository.findByCode(couponCode);

            order.setCoupon(coupon);
            order.setDiscountAmount(discount);
            totalPrice = totalPrice.subtract(discount);
        } else {
            order.setDiscountAmount(BigDecimal.ZERO);
            order.setCoupon(null);
        }

        if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
            totalPrice = BigDecimal.ZERO;
        }
        order.setTotalPrice(totalPrice);

        // Lưu đơn hàng vào cơ sở dữ liệu
        orderRepository.persist(order);

        // Cập nhật tăng số lần sử dụng của Coupon
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            couponService.updateUsageCount(couponCode);
        }

        // Dọn dẹp giỏ hàng
        cart.getItems().clear();
        // Nhờ cấu hình cascade orphanRemoval = true ở Cart, các CartItem tự động bị xóa khỏi DB
        
        return orderMapper.toResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(orderMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id);
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng với ID: " + id);
        }
        return orderMapper.toResponseDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id);
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng với ID: " + id);
        }
        
        // Cập nhật trạng thái
        order.setStatus(status);

        // Nếu trạng thái là CANCELLED, có thể cần cộng lại kho (tạo StockMovement IN hoặc RETURN)
        if (status == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getOrderItems()) {
                StockMovementRequestDTO returnDTO = new StockMovementRequestDTO(
                        item.getVariant().getId(),
                        item.getQuantity(),
                        MovementType.RETURN,
                        "Hoàn kho do đơn hàng #" + id + " bị hủy"
                );
                stockMovementService.create(returnDTO);
            }
        }

        return orderMapper.toResponseDTO(order);
    }
}
