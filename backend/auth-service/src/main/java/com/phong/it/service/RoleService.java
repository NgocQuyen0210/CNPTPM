package com.phong.it.service;

import java.util.List;

import com.phong.it.dto.request.RoleRequestDTO;
import com.phong.it.dto.response.RoleResponseDTO;

public interface RoleService {
    
    RoleResponseDTO createRole(RoleRequestDTO requestDTO);

    List<RoleResponseDTO> getAllRoles();

    RoleResponseDTO getRoleById(Long id);

    RoleResponseDTO updateRole(Long id, RoleRequestDTO requestDTO);

    void deleteRole(Long id);
}
