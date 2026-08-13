package com.phong.it.service.impl;

import com.phong.it.dto.request.AddToCartRequestDTO;
import com.phong.it.dto.response.CartResponseDTO;
import com.phong.it.entity.Cart;
import com.phong.it.entity.CartItem;
import com.phong.it.entity.ProductVariant;
import com.phong.it.entity.User;
import com.phong.it.mapper.CartMapper;
import com.phong.it.repository.CartItemRepository;
import com.phong.it.repository.CartRepository;
import com.phong.it.repository.ProductVariantRepository;
import com.phong.it.repository.UserRepository;
import com.phong.it.service.CartService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;

@ApplicationScoped
public class CartServiceImpl implements CartService {

    @Inject
    CartRepository cartRepository;

    @Inject
    CartItemRepository cartItemRepository;

    @Inject
    ProductVariantRepository productVariantRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    CartMapper cartMapper;

    @Override
    @Transactional
    public CartResponseDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDTO addToCart(Long userId, AddToCartRequestDTO requestDTO) {
        Cart cart = getOrCreateCart(userId);

        ProductVariant variant = null;
        if (requestDTO.variantId() != null) {
            variant = productVariantRepository.findById(requestDTO.variantId());
        } else if (requestDTO.productId() != null) {
            java.util.List<ProductVariant> variants = productVariantRepository.findByProductId(requestDTO.productId());
            if (variants != null && !variants.isEmpty()) {
                variant = variants.get(0);
            }
        }

        if (variant == null) {
            throw new BadRequestException("Không tìm thấy biến thể sản phẩm hợp lệ.");
        }

        final Long targetVariantId = variant.getId();
        // Tìm item trong giỏ hàng xem đã có biến thể này chưa
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(targetVariantId))
                .findFirst()
                .orElse(null);

        int newQuantity = requestDTO.quantity();
        if (existingItem != null) {
            newQuantity += existingItem.getQuantity();
        }

        // Kiểm tra tồn kho
        int stock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        if (stock < newQuantity) {
            throw new BadRequestException("Số lượng tồn kho không đủ. Tồn kho hiện tại: " + stock);
        }

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(newQuantity);
            cart.getItems().add(newItem);
        }

        cartRepository.persist(cart);
        return cartMapper.toDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDTO updateQuantity(Long userId, Long itemId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng cập nhật phải lớn hơn 0");
        }

        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong giỏ hàng với ID: " + itemId));

        ProductVariant variant = item.getVariant();
        int stock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        
        if (stock < quantity) {
             throw new BadRequestException("Số lượng tồn kho không đủ. Tồn kho hiện tại: " + stock);
        }

        item.setQuantity(quantity);
        return cartMapper.toDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDTO removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        
        CartItem itemToRemove = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong giỏ hàng với ID: " + itemId));

        cart.getItems().remove(itemToRemove);
        // Nhờ cấu hình cascade = CascadeType.ALL, orphanRemoval = true ở Cart entity, CartItem sẽ tự động bị xóa trong DB.
        
        return cartMapper.toDto(cart);
    }

    /**
     * Lấy giỏ hàng của user. Nếu chưa có, tạo mới và lưu vào DB.
     */
    private Cart getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            User user = userRepository.findById(userId);
            if (user == null) {
                throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
            }
            cart = new Cart();
            cart.setUser(user);
            cart.setItems(new ArrayList<>());
            cartRepository.persist(cart);
        }
        return cart;
    }
}
