package com.phong.it.service.impl;

import com.phong.it.dto.request.WishlistRequestDTO;
import com.phong.it.dto.response.WishlistResponseDTO;
import com.phong.it.client.AuthServiceClient;
import com.phong.it.client.ProductServiceClient;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.entity.Wishlist;
import com.phong.it.helper.ApiResponse;
import com.phong.it.mapper.WishlistMapper;
import com.phong.it.repository.WishlistRepository;
import com.phong.it.service.WishlistService;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.math.BigDecimal;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class WishlistServiceImpl implements WishlistService {

    @Inject
    WishlistRepository wishlistRepository;

    @Inject
    @RestClient
    ProductServiceClient productServiceClient;

    @Inject
    @RestClient
    AuthServiceClient authServiceClient;

    @Inject
    WishlistMapper wishlistMapper;

    @Override
    @Transactional
    public WishlistResponseDTO addToWishlist(Long userId, WishlistRequestDTO requestDTO) {
        ApiResponse<ProductResponseDTO> productResponse = productServiceClient.getProductById(requestDTO.productId());
        if (productResponse == null || !productResponse.success() || productResponse.data() == null) {
            throw new NotFoundException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
        }

        ApiResponse<UserResponseDTO> userResponse = authServiceClient.getUserById(userId);
        if (userResponse == null || !userResponse.success() || userResponse.data() == null) {
            throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }

        // Kiểm tra xem sản phẩm đã có trong wishlist của user chưa
        Wishlist existingWishlist = wishlistRepository.findByUserIdAndProductId(userId, requestDTO.productId());
        if (existingWishlist != null) {
            throw new BadRequestException("Sản phẩm này đã tồn tại trong danh sách yêu thích của bạn");
        }

        Wishlist wishlist = wishlistMapper.toEntity(requestDTO);
        wishlist.setUserId(userId);
        wishlist.setProductId(requestDTO.productId());

        wishlistRepository.persist(wishlist);
        
        WishlistResponseDTO responseDTO = new WishlistResponseDTO(
            wishlist.getId(),
            requestDTO.productId(),
            productResponse.data().name(),
            productResponse.data().price(),
            productResponse.data().featuredImage(),
            wishlist.getCreatedAt()
        );
        return responseDTO;
    }

    @Override
    public List<WishlistResponseDTO> getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(wishlist -> {
                    ProductResponseDTO product = null;
                    try {
                        ApiResponse<ProductResponseDTO> prodResp = productServiceClient.getProductById(wishlist.getProductId());
                        if (prodResp != null && prodResp.success()) {
                            product = prodResp.data();
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                    return new WishlistResponseDTO(
                        wishlist.getId(),
                        wishlist.getProductId(),
                        product != null ? product.name() : "Sản phẩm không khả dụng",
                        product != null ? product.price() : BigDecimal.ZERO,
                        product != null ? product.featuredImage() : null,
                        wishlist.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long id) {
        Wishlist wishlist = wishlistRepository.findById(id);
        if (wishlist == null) {
            throw new NotFoundException("Không tìm thấy mục yêu thích với ID: " + id);
        }

        if (!wishlist.getUserId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xóa sản phẩm này khỏi danh sách yêu thích");
        }

        wishlistRepository.delete(wishlist);
    }
}
