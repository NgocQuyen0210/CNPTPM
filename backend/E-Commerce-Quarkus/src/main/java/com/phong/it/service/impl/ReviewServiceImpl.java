package com.phong.it.service.impl;

import com.phong.it.dto.request.ReviewRequestDTO;
import com.phong.it.dto.response.ReviewResponseDTO;
import com.phong.it.entity.Product;
import com.phong.it.entity.Review;
import com.phong.it.entity.User;
import com.phong.it.mapper.ReviewMapper;
import com.phong.it.repository.ProductRepository;
import com.phong.it.repository.ReviewRepository;
import com.phong.it.repository.UserRepository;
import com.phong.it.service.ReviewService;
import io.quarkus.cache.CacheResult;
import io.quarkus.cache.CacheInvalidateAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ReviewServiceImpl implements ReviewService {

    @Inject
    ReviewRepository reviewRepository;

    @Inject
    ProductRepository productRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    ReviewMapper reviewMapper;

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "reviews")
    public ReviewResponseDTO create(Long userId, ReviewRequestDTO requestDTO) {
        Product product = productRepository.findById(requestDTO.productId());
        if (product == null) {
            throw new NotFoundException("Không tìm thấy sản phẩm với ID: " + requestDTO.productId());
        }

        User user = userRepository.findById(userId);
        if (user == null) {
            throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }

        Review review = reviewMapper.toEntity(requestDTO);
        review.setProduct(product);
        review.setUser(user);
        review.setUserFullName(user.getFullName());
        review.setStatus(false); // Đánh giá ở trạng thái chờ duyệt ban đầu

        reviewRepository.persist(review);
        return reviewMapper.toResponseDTO(review);
    }

    @Override
    @CacheResult(cacheName = "reviews")
    public ReviewResponseDTO getById(Long id) {
        Review review = reviewRepository.findById(id);
        if (review == null) {
            throw new NotFoundException("Không tìm thấy đánh giá với ID: " + id);
        }
        return reviewMapper.toResponseDTO(review);
    }

    @Override
    @CacheResult(cacheName = "reviews")
    public List<ReviewResponseDTO> getAll() {
        return reviewRepository.listAll().stream()
                .map(reviewMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CacheResult(cacheName = "reviews")
    public List<ReviewResponseDTO> getReviewsByProductId(Long productId, boolean approvedOnly) {
        List<Review> reviews;
        if (approvedOnly) {
            reviews = reviewRepository.findByProductIdAndStatus(productId, true);
        } else {
            reviews = reviewRepository.findByProductId(productId);
        }
        return reviews.stream()
                .map(reviewMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "reviews")
    public ReviewResponseDTO update(Long userId, Long id, ReviewRequestDTO requestDTO) {
        Review review = reviewRepository.findById(id);
        if (review == null) {
            throw new NotFoundException("Không tìm thấy đánh giá với ID: " + id);
        }

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa đánh giá này");
        }

        review.setRating(requestDTO.rating());
        review.setComment(requestDTO.comment());
        review.setStatus(false); // Reset lại trạng thái chờ duyệt sau khi sửa đổi

        return reviewMapper.toResponseDTO(review);
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "reviews")
    public ReviewResponseDTO approveReview(Long id) {
        Review review = reviewRepository.findById(id);
        if (review == null) {
            throw new NotFoundException("Không tìm thấy đánh giá với ID: " + id);
        }
        review.setStatus(true);
        return reviewMapper.toResponseDTO(review);
    }

    @Override
    @Transactional
    @CacheInvalidateAll(cacheName = "reviews")
    public void delete(Long userId, Long id) {
        Review review = reviewRepository.findById(id);
        if (review == null) {
            throw new NotFoundException("Không tìm thấy đánh giá với ID: " + id);
        }

        User currentUser = userRepository.findById(userId);
        if (currentUser == null) {
            throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }

        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN"));

        if (!review.getUser().getId().equals(userId) && !isAdmin) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }
}
