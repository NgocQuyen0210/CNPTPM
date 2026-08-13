package com.phong.it.service.impl;

import com.phong.it.dto.request.SupplierRequestDTO;
import com.phong.it.dto.response.SupplierResponseDTO;
import com.phong.it.entity.Supplier;
import com.phong.it.mapper.SupplierMapper;
import com.phong.it.repository.SupplierRepository;
import com.phong.it.service.SupplierService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class SupplierServiceImpl implements SupplierService {

    @Inject
    SupplierRepository supplierRepository;

    @Inject
    SupplierMapper supplierMapper;

    @Override
    @Transactional
    public SupplierResponseDTO create(SupplierRequestDTO requestDTO) {
        Supplier supplier = supplierMapper.toEntity(requestDTO);
        supplierRepository.persist(supplier);
        return supplierMapper.toDto(supplier);
    }

    @Override
    public SupplierResponseDTO getById(Long id) {
        Supplier supplier = supplierRepository.findById(id);
        if (supplier == null) {
            throw new NotFoundException("Không tìm thấy nhà cung cấp với ID: " + id);
        }
        return supplierMapper.toDto(supplier);
    }

    @Override
    public List<SupplierResponseDTO> getAll() {
        return supplierRepository.listAll().stream()
                .map(supplierMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupplierResponseDTO update(Long id, SupplierRequestDTO requestDTO) {
        Supplier supplier = supplierRepository.findById(id);
        if (supplier == null) {
            throw new NotFoundException("Không tìm thấy nhà cung cấp với ID: " + id);
        }

        supplier.setName(requestDTO.name());
        supplier.setContactName(requestDTO.contactName());
        supplier.setEmail(requestDTO.email());
        supplier.setPhone(requestDTO.phone());
        supplier.setAddress(requestDTO.address());

        return supplierMapper.toDto(supplier);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Supplier supplier = supplierRepository.findById(id);
        if (supplier == null) {
            throw new NotFoundException("Không tìm thấy nhà cung cấp với ID: " + id);
        }

        // Validate before delete
        if (supplier.getProducts() != null && !supplier.getProducts().isEmpty()) {
            throw new BadRequestException("Không thể xóa nhà cung cấp đang có sản phẩm liên kết");
        }

        supplierRepository.delete(supplier);
    }
}
