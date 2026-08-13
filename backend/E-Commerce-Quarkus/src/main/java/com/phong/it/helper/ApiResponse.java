package com.phong.it.helper;

import java.time.LocalDateTime;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        LocalDateTime timestamp) {
    // Factory method cho trường hợp thành công
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }

    // Factory method cho trường hợp thành công (mặc định message)
    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Thao tác thành công");
    }

    // Factory method cho trường hợp lỗi
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now());
    }
}