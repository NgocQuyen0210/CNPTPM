package com.phong.it.service;

import com.phong.it.dto.request.StockMovementRequestDTO;
import com.phong.it.dto.response.StockMovementResponseDTO;

import java.util.List;

public interface StockMovementService {
    StockMovementResponseDTO create(StockMovementRequestDTO requestDTO);
    StockMovementResponseDTO getById(Long id);
    List<StockMovementResponseDTO> getAll();
}
