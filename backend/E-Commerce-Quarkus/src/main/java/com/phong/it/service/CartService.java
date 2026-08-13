package com.phong.it.service;

import com.phong.it.dto.request.AddToCartRequestDTO;
import com.phong.it.dto.response.CartResponseDTO;

public interface CartService {
    CartResponseDTO getCartByUserId(Long userId);
    CartResponseDTO addToCart(Long userId, AddToCartRequestDTO requestDTO);
    CartResponseDTO updateQuantity(Long userId, Long itemId, Integer quantity);
    CartResponseDTO removeItem(Long userId, Long itemId);
}
