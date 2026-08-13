package com.phong.it.service.impl;

import com.phong.it.dto.request.OrderRequestDTO;
import com.phong.it.dto.request.StockMovementRequestDTO;
import com.phong.it.dto.response.OrderResponseDTO;
import com.phong.it.client.AuthServiceClient;
import com.phong.it.client.ProductServiceClient;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.dto.response.ProductVariantResponseDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.helper.ApiResponse;
import com.phong.it.entity.*;
import com.phong.it.mapper.OrderMapper;
import com.phong.it.repository.CartRepository;
import com.phong.it.repository.CouponRepository;
import com.phong.it.repository.OrderRepository;
import com.phong.it.service.CouponService;
import com.phong.it.service.OrderService;
import org.eclipse.microprofile.rest.client.inject.RestClient;
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
    @RestClient
    AuthServiceClient authServiceClient;

    @Inject
    @RestClient
    ProductServiceClient productServiceClient;

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

        ApiResponse<UserResponseDTO> userResponse = authServiceClient.getUserById(userId);
        if (userResponse == null || !userResponse.success() || userResponse.data() == null) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        // Tạo đơn hàng từ DTO
        Order order = orderMapper.toEntity(requestDTO);
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderItems(new ArrayList<>());

        BigDecimal totalPrice = BigDecimal.ZERO;

        // Xử lý từng sản phẩm trong giỏ hàng
        for (CartItem cartItem : cart.getItems()) {
            Long variantId = cartItem.getProductVariantId();
            int quantity = cartItem.getQuantity();

            ApiResponse<ProductVariantResponseDTO> variantResp = productServiceClient.getVariantById(variantId);
            if (variantResp == null || !variantResp.success() || variantResp.data() == null) {
                throw new NotFoundException("Không tìm thấy biến thể với ID: " + variantId);
            }
            ProductVariantResponseDTO variant = variantResp.data();

            // Tạo OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductVariantId(variantId);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(variant.price()); // Giá tại thời điểm đặt hàng

            order.getOrderItems().add(orderItem);

            // Tính tổng tiền
            BigDecimal itemTotal = variant.price().multiply(BigDecimal.valueOf(quantity));
            totalPrice = totalPrice.add(itemTotal);

            // Trừ kho và tạo StockMovement OUT
            StockMovementRequestDTO movementDTO = new StockMovementRequestDTO(
                    variant.id(),
                    quantity,
                    MovementType.OUT,
                    "Xuất kho cho đơn hàng mới của user " + userId
            );
            productServiceClient.createStockMovement(movementDTO);
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
        
        return mapToResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id);
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng với ID: " + id);
        }
        return mapToResponseDTO(order);
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
                        item.getProductVariantId(),
                        item.getQuantity(),
                        MovementType.RETURN,
                        "Hoàn kho do đơn hàng #" + id + " bị hủy"
                );
                productServiceClient.createStockMovement(returnDTO);
            }
        }

        return mapToResponseDTO(order);
    }

    private OrderResponseDTO mapToResponseDTO(Order order) {
        List<com.phong.it.dto.response.OrderItemResponseDTO> itemDTOs = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                ProductVariantResponseDTO variant = null;
                ProductResponseDTO product = null;
                try {
                    ApiResponse<ProductVariantResponseDTO> varResp = productServiceClient.getVariantById(item.getProductVariantId());
                    if (varResp != null && varResp.success() && varResp.data() != null) {
                        variant = varResp.data();
                        ApiResponse<ProductResponseDTO> prodResp = productServiceClient.getProductById(variant.productId());
                        if (prodResp != null && prodResp.success()) {
                            product = prodResp.data();
                        }
                    }
                } catch (Exception e) {
                    // ignore
                }

                itemDTOs.add(new com.phong.it.dto.response.OrderItemResponseDTO(
                    item.getId(),
                    item.getQuantity(),
                    item.getPrice(),
                    item.getProductVariantId(),
                    variant != null ? variant.name() : "Biến thể không khả dụng",
                    product != null ? product.name() : "Sản phẩm không khả dụng"
                ));
            }
        }
        
        return new OrderResponseDTO(
            order.getId(),
            order.getTotalPrice(),
            order.getStatus(),
            order.getShippingFullName(),
            order.getShippingPhone(),
            order.getProvince(),
            order.getDistrict(),
            order.getWard(),
            order.getDetailAddress(),
            order.getShippingNote(),
            order.getCreatedAt(),
            order.getUserId(),
            order.getPaymentMethod(),
            order.getDiscountAmount(),
            itemDTOs
        );
    }
}
