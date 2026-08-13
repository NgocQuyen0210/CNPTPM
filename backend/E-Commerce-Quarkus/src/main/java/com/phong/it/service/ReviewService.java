package com.phong.it.service;

import com.phong.it.dto.request.ReviewRequestDTO;
import com.phong.it.dto.response.ReviewResponseDTO;
import java.util.List;

public interface ReviewService {
    ReviewResponseDTO create(Long userId, ReviewRequestDTO requestDTO);
    ReviewResponseDTO getById(Long id);
    List<ReviewResponseDTO> getAll();
    List<ReviewResponseDTO> getReviewsByProductId(Long productId, boolean approvedOnly);
    ReviewResponseDTO update(Long userId, Long id, ReviewRequestDTO requestDTO);
    ReviewResponseDTO approveReview(Long id);
    void delete(Long userId, Long id);
}
