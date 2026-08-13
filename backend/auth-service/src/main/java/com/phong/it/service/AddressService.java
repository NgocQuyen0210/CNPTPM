package com.phong.it.service;

import com.phong.it.dto.request.AddressRequestDTO;
import com.phong.it.dto.response.AddressResponseDTO;

import java.util.List;

public interface AddressService {
    List<AddressResponseDTO> getByUserId(Long userId);
    AddressResponseDTO create(Long userId, AddressRequestDTO requestDTO);
    AddressResponseDTO update(Long userId, Long id, AddressRequestDTO requestDTO);
    void delete(Long userId, Long id);
    AddressResponseDTO setDefault(Long userId, Long id);
}
