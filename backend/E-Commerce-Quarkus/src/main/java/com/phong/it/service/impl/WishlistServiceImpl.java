package com.phong.it.service.impl;

import com.phong.it.dto.request.WishlistRequestDTO;
import com.phong.it.dto.response.WishlistResponseDTO;
import com.phong.it.entity.Product;
import com.phong.it.entity.User;
import com.phong.it.entity.Wishlist;
import com.phong.it.mapper.WishlistMapper;
import com.phong.it.repository.ProductRepository;
import com.phong.it.repository.UserRepository;
import com.phong.it.repository.WishlistRepository;
import com.phong.it.service.WishlistService;
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
    ProductRepository productRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    WishlistMapper wishlistMapper;

    @Override
    @Transactional
    public WishlistResponseDTO addToWishlist(Long userId, WishlistRequestDTO requestDTO) {
        Product product = productRepository.findById(requestDTO.productId());
        if (product == null) {
            throw new NotFoundException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
        }

        User user = userRepository.findById(userId);
        if (user == null) {
            throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }

        // Kiểm tra xem sản phẩm đã có trong wishlist của user chưa
        Wishlist existingWishlist = wishlistRepository.findByUserIdAndProductId(userId, requestDTO.productId());
        if (existingWishlist != null) {
            throw new BadRequestException("Sản phẩm này đã tồn tại trong danh sách yêu thích của bạn");
        }

        Wishlist wishlist = wishlistMapper.toEntity(requestDTO);
        wishlist.setUser(user);
        wishlist.setProduct(product);

        wishlistRepository.persist(wishlist);
        return wishlistMapper.toResponseDTO(wishlist);
    }

    @Override
    public List<WishlistResponseDTO> getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(wishlistMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long id) {
        Wishlist wishlist = wishlistRepository.findById(id);
        if (wishlist == null) {
            throw new NotFoundException("Không tìm thấy mục yêu thích với ID: " + id);
        }

        if (!wishlist.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xóa sản phẩm này khỏi danh sách yêu thích");
        }

        wishlistRepository.delete(wishlist);
    }
}
