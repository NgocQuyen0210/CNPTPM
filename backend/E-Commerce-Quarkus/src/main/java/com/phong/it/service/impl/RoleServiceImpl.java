package com.phong.it.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import com.phong.it.dto.request.RoleRequestDTO;
import com.phong.it.dto.response.RoleResponseDTO;
import com.phong.it.entity.Role;
import com.phong.it.mapper.RoleMapper;
import com.phong.it.repository.RoleRepository;
import com.phong.it.service.RoleService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class RoleServiceImpl implements RoleService {

    @Inject
    RoleRepository roleRepository;

    @Inject
    RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponseDTO createRole(RoleRequestDTO requestDTO) {
        if (roleRepository.findByName(requestDTO.name()) != null) {
            throw new WebApplicationException("Tên Role đã tồn tại", Status.BAD_REQUEST);
        }

        Role role = roleMapper.toEntity(requestDTO);
        roleRepository.persist(role);
        
        return roleMapper.toResponseDTO(role);
    }

    @Override
    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponseDTO getRoleById(Long id) {
        Role role = roleRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Role với ID: " + id));
        return roleMapper.toResponseDTO(role);
    }

    @Override
    @Transactional
    public RoleResponseDTO updateRole(Long id, RoleRequestDTO requestDTO) {
        Role existingRole = roleRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Role với ID: " + id));

        if (!existingRole.getName().equals(requestDTO.name())) {
            if (roleRepository.findByName(requestDTO.name()) != null) {
                throw new WebApplicationException("Tên Role đã tồn tại", Status.BAD_REQUEST);
            }
            existingRole.setName(requestDTO.name());
        }

        existingRole.setDescription(requestDTO.description());

        return roleMapper.toResponseDTO(existingRole);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role existingRole = roleRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Role với ID: " + id));
        
        roleRepository.delete(existingRole);
    }
}
