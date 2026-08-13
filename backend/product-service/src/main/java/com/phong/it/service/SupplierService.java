package com.phong.it.service;

import com.phong.it.dto.request.SupplierRequestDTO;
import com.phong.it.dto.response.SupplierResponseDTO;

import java.util.List;

public interface SupplierService {
    SupplierResponseDTO create(SupplierRequestDTO requestDTO);
    SupplierResponseDTO getById(Long id);
    List<SupplierResponseDTO> getAll();
    SupplierResponseDTO update(Long id, SupplierRequestDTO requestDTO);
    void delete(Long id);
}
