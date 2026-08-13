package com.phong.it.service;

import com.phong.it.dto.request.WishlistRequestDTO;
import com.phong.it.dto.response.WishlistResponseDTO;
import java.util.List;

public interface WishlistService {
    WishlistResponseDTO addToWishlist(Long userId, WishlistRequestDTO requestDTO);
    List<WishlistResponseDTO> getWishlistByUserId(Long userId);
    void removeFromWishlist(Long userId, Long id);
}
