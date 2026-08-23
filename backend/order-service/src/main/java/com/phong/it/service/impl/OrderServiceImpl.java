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
import java.util.Map;
import java.util.HashMap;
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

            // Kiểm tra tồn kho trước khi đặt hàng (chưa trừ kho thực tế)
            if (variant.stockQuantity() == null || variant.stockQuantity() < quantity) {
                throw new BadRequestException("Sản phẩm '" + variant.name() + "' không đủ số lượng tồn kho. Hiện tại chỉ còn: " + (variant.stockQuantity() == null ? 0 : variant.stockQuantity()));
            }
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

    private void checkAndTransitionStatus(Order order) {
        if (order == null || order.getCreatedAt() == null) return;
        OrderStatus currentStatus = order.getStatus();
        
        // Only auto-transition active, non-terminal orders (PENDING, PROCESSING, SHIPPED)
        if (currentStatus == OrderStatus.PENDING || currentStatus == OrderStatus.PROCESSING || currentStatus == OrderStatus.SHIPPED) {
            long daysElapsed = java.time.temporal.ChronoUnit.DAYS.between(order.getCreatedAt(), java.time.LocalDateTime.now());
            if (daysElapsed >= 2) {
                order.setStatus(OrderStatus.DELIVERED);
                deductStockForOrder(order); // Trừ kho tự động khi giao thành công
            } else if (daysElapsed >= 1 && (currentStatus == OrderStatus.PENDING || currentStatus == OrderStatus.PROCESSING)) {
                order.setStatus(OrderStatus.SHIPPED);
            }
        }
    }

    @Override
    @Transactional
    public List<OrderResponseDTO> getOrderHistory(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        Map<Long, ProductVariantResponseDTO> variantCache = new HashMap<>();
        Map<Long, ProductResponseDTO> productCache = new HashMap<>();
        for (Order order : orders) {
            checkAndTransitionStatus(order);
        }
        return orders.stream()
                .map(order -> this.mapToResponseDTO(order, variantCache, productCache))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.listAll();
        Map<Long, ProductVariantResponseDTO> variantCache = new HashMap<>();
        Map<Long, ProductResponseDTO> productCache = new HashMap<>();
        for (Order order : orders) {
            checkAndTransitionStatus(order);
        }
        return orders.stream()
                .map(order -> this.mapToResponseDTO(order, variantCache, productCache))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id);
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng với ID: " + id);
        }
        checkAndTransitionStatus(order);
        return mapToResponseDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id);
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng với ID: " + id);
        }
        
        // Đồng bộ trạng thái tự động trước
        checkAndTransitionStatus(order);
        
        OrderStatus currentStatus = order.getStatus();

        // 1. Validation for user-triggered cancellations
        if (status == OrderStatus.CANCELLED) {
            if (currentStatus == OrderStatus.SHIPPED || currentStatus == OrderStatus.DELIVERED) {
                throw new BadRequestException("Đơn hàng đang giao hoặc đã giao, không thể hủy.");
            }
            if (currentStatus == OrderStatus.COMPLETED || currentStatus == OrderStatus.RETURNED) {
                throw new BadRequestException("Đơn hàng đã hoàn thành hoặc đã trả hàng, không thể hủy.");
            }
        }

        // 2. Validation for completing order (received)
        if (status == OrderStatus.COMPLETED) {
            if (currentStatus != OrderStatus.DELIVERED) {
                throw new BadRequestException("Chỉ có thể xác nhận nhận hàng khi đơn hàng ở trạng thái đã giao đến bạn.");
            }
        }

        // 3. Validation for returning order
        if (status == OrderStatus.RETURNED) {
            if (currentStatus != OrderStatus.DELIVERED) {
                throw new BadRequestException("Chỉ có thể hoàn hàng khi đơn hàng ở trạng thái đã giao đến bạn.");
            }
        }

        // Cập nhật trạng thái
        order.setStatus(status);

        // Kiểm tra xem trạng thái mới và cũ có phải là giao hàng thành công hay không
        boolean isNowDelivered = (status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED);
        boolean wasDelivered = (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.COMPLETED);
        
        if (isNowDelivered && !wasDelivered) {
            deductStockForOrder(order);
        }
        
        if (status == OrderStatus.RETURNED && wasDelivered) {
            returnStockForOrder(order);
        }

        return mapToResponseDTO(order);
    }

    private void deductStockForOrder(Order order) {
        if (order.getOrderItems() == null) return;
        for (OrderItem item : order.getOrderItems()) {
            StockMovementRequestDTO movementDTO = new StockMovementRequestDTO(
                    item.getProductVariantId(),
                    item.getQuantity(),
                    MovementType.OUT,
                    "Xuất kho cho đơn hàng #" + order.getId() + " giao thành công"
            );
            productServiceClient.createStockMovement(movementDTO);
        }
    }

    private void returnStockForOrder(Order order) {
        if (order.getOrderItems() == null) return;
        for (OrderItem item : order.getOrderItems()) {
            StockMovementRequestDTO returnDTO = new StockMovementRequestDTO(
                    item.getProductVariantId(),
                    item.getQuantity(),
                    MovementType.RETURN,
                    "Hoàn kho do đơn hàng #" + order.getId() + " bị trả hàng"
            );
            productServiceClient.createStockMovement(returnDTO);
        }
    }

    private OrderResponseDTO mapToResponseDTO(Order order) {
        return mapToResponseDTO(order, new HashMap<>(), new HashMap<>());
    }

    private OrderResponseDTO mapToResponseDTO(Order order, 
                                              Map<Long, ProductVariantResponseDTO> variantCache, 
                                              Map<Long, ProductResponseDTO> productCache) {
        List<com.phong.it.dto.response.OrderItemResponseDTO> itemDTOs = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                ProductVariantResponseDTO variant = null;
                ProductResponseDTO product = null;
                try {
                    Long varId = item.getProductVariantId();
                    if (variantCache.containsKey(varId)) {
                        variant = variantCache.get(varId);
                    } else {
                        ApiResponse<ProductVariantResponseDTO> varResp = productServiceClient.getVariantById(varId);
                        if (varResp != null && varResp.success() && varResp.data() != null) {
                            variant = varResp.data();
                            variantCache.put(varId, variant);
                        }
                    }

                    if (variant != null) {
                        Long prodId = variant.productId();
                        if (productCache.containsKey(prodId)) {
                            product = productCache.get(prodId);
                        } else {
                            ApiResponse<ProductResponseDTO> prodResp = productServiceClient.getProductById(prodId);
                            if (prodResp != null && prodResp.success() && prodResp.data() != null) {
                                product = prodResp.data();
                                productCache.put(prodId, product);
                            }
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
