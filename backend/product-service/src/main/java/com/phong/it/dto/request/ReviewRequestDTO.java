package com.phong.it.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequestDTO(
    @NotNull(message = "ID sản phẩm không được để trống")
    Long productId,

    @NotNull(message = "Đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    Integer rating,

    @NotBlank(message = "Nội dung bình luận không được để trống")
    String comment
) {
}
