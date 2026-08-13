package com.phong.it.service.impl;

import com.phong.it.dto.request.AddToCartRequestDTO;
import com.phong.it.dto.response.CartResponseDTO;
import com.phong.it.client.AuthServiceClient;
import com.phong.it.client.ProductServiceClient;
import com.phong.it.dto.response.CartItemResponseDTO;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.dto.response.ProductVariantResponseDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.entity.Cart;
import com.phong.it.entity.CartItem;
import com.phong.it.helper.ApiResponse;
import com.phong.it.repository.CartItemRepository;
import com.phong.it.repository.CartRepository;
import com.phong.it.service.CartService;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.math.BigDecimal;
import java.util.List;
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
    @RestClient
    ProductServiceClient productServiceClient;

    @Inject
    @RestClient
    AuthServiceClient authServiceClient;

    @Override
    @Transactional
    public CartResponseDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponseDTO(cart);
    }

    @Override
    @Transactional
    public CartResponseDTO addToCart(Long userId, AddToCartRequestDTO requestDTO) {
        Cart cart = getOrCreateCart(userId);

        Long variantId = requestDTO.variantId();
        ProductVariantResponseDTO variant = null;
        if (variantId != null) {
            ApiResponse<ProductVariantResponseDTO> variantResp = productServiceClient.getVariantById(variantId);
            if (variantResp != null && variantResp.success()) {
                variant = variantResp.data();
            }
        } else if (requestDTO.productId() != null) {
            ApiResponse<java.util.List<ProductVariantResponseDTO>> variantsResp = productServiceClient.getVariantsByProductId(requestDTO.productId());
            if (variantsResp != null && variantsResp.success() && variantsResp.data() != null && !variantsResp.data().isEmpty()) {
                variant = variantsResp.data().get(0);
                variantId = variant.id();
            }
        }

        if (variant == null) {
            throw new BadRequestException("Không tìm thấy biến thể sản phẩm hợp lệ.");
        }

        final Long targetVariantId = variantId;
        // Tìm item trong giỏ hàng xem đã có biến thể này chưa
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductVariantId().equals(targetVariantId))
                .findFirst()
                .orElse(null);

        int newQuantity = requestDTO.quantity();
        if (existingItem != null) {
            newQuantity += existingItem.getQuantity();
        }

        // Kiểm tra tồn kho
        int stock = variant.stockQuantity() != null ? variant.stockQuantity() : 0;
        if (stock < newQuantity) {
            throw new BadRequestException("Số lượng tồn kho không đủ. Tồn kho hiện tại: " + stock);
        }

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductVariantId(targetVariantId);
            newItem.setQuantity(newQuantity);
            cart.getItems().add(newItem);
        }

        cartRepository.persist(cart);
        return mapToResponseDTO(cart);
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

        ApiResponse<ProductVariantResponseDTO> variantResp = productServiceClient.getVariantById(item.getProductVariantId());
        if (variantResp == null || !variantResp.success() || variantResp.data() == null) {
            throw new NotFoundException("Không tìm thấy biến thể sản phẩm");
        }
        ProductVariantResponseDTO variant = variantResp.data();
        int stock = variant.stockQuantity() != null ? variant.stockQuantity() : 0;
        
        if (stock < quantity) {
             throw new BadRequestException("Số lượng tồn kho không đủ. Tồn kho hiện tại: " + stock);
        }

        item.setQuantity(quantity);
        return mapToResponseDTO(cart);
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
        
        return mapToResponseDTO(cart);
    }

    /**
     * Lấy giỏ hàng của user. Nếu chưa có, tạo mới và lưu vào DB.
     */
    private Cart getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            ApiResponse<UserResponseDTO> userResponse = authServiceClient.getUserById(userId);
            if (userResponse == null || !userResponse.success() || userResponse.data() == null) {
                throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
            }
            cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            cartRepository.persist(cart);
        }
        return cart;
    }

    private CartResponseDTO mapToResponseDTO(Cart cart) {
        List<CartItemResponseDTO> itemDTOs = new ArrayList<>();
        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
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

                itemDTOs.add(new CartItemResponseDTO(
                    item.getId(),
                    item.getQuantity(),
                    item.getProductVariantId(),
                    variant != null ? variant.name() : "Biến thể không khả dụng",
                    variant != null ? variant.price() : BigDecimal.ZERO,
                    product != null ? product.name() : "Sản phẩm không khả dụng",
                    product != null ? product.featuredImage() : null
                ));
            }
        }
        return new CartResponseDTO(
            cart.getId(),
            cart.getUpdatedAt(),
            cart.getUserId(),
            itemDTOs
        );
    }
}
