package com.phong.it.service.impl;

import com.phong.it.dto.request.AddressRequestDTO;
import com.phong.it.dto.response.AddressResponseDTO;
import com.phong.it.entity.Address;
import com.phong.it.entity.User;
import com.phong.it.mapper.AddressMapper;
import com.phong.it.repository.AddressRepository;
import com.phong.it.repository.UserRepository;
import com.phong.it.service.AddressService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AddressServiceImpl implements AddressService {

    @Inject
    AddressRepository addressRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    AddressMapper addressMapper;

    @Override
    public List<AddressResponseDTO> getByUserId(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponseDTO create(Long userId, AddressRequestDTO requestDTO) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        
        Address address = addressMapper.toEntity(requestDTO);
        address.setUser(user);

        // Nếu đây là địa chỉ đầu tiên, hoặc user chọn làm mặc định
        if (existingAddresses.isEmpty() || Boolean.TRUE.equals(requestDTO.isDefault())) {
            address.setIsDefault(true);
            unsetOtherDefaults(userId, null);
        } else {
            address.setIsDefault(false);
        }

        addressRepository.persist(address);
        return addressMapper.toDto(address);
    }

    @Override
    @Transactional
    public AddressResponseDTO update(Long userId, Long id, AddressRequestDTO requestDTO) {
        Address address = addressRepository.findById(id);
        if (address == null || !address.getUser().getId().equals(userId)) {
            throw new NotFoundException("Không tìm thấy địa chỉ của bạn với ID: " + id);
        }

        address.setFullName(requestDTO.fullName());
        address.setPhoneNumber(requestDTO.phoneNumber());
        address.setProvince(requestDTO.province());
        address.setDistrict(requestDTO.district());
        address.setWard(requestDTO.ward());
        address.setDetailAddress(requestDTO.detailAddress());

        // Nếu update thành mặc định
        if (Boolean.TRUE.equals(requestDTO.isDefault()) && !address.isIsDefault()) {
            address.setIsDefault(true);
            unsetOtherDefaults(userId, id);
        } else if (Boolean.FALSE.equals(requestDTO.isDefault()) && address.isIsDefault()) {
            // Không cho phép tự ý bỏ mặc định nếu nó đang là mặc định, phải set cái khác làm mặc định thay thế
            throw new BadRequestException("Không thể bỏ chọn địa chỉ mặc định trực tiếp. Vui lòng chọn địa chỉ khác làm mặc định.");
        }

        return addressMapper.toDto(address);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        Address address = addressRepository.findById(id);
        if (address == null || !address.getUser().getId().equals(userId)) {
            throw new NotFoundException("Không tìm thấy địa chỉ của bạn với ID: " + id);
        }

        boolean wasDefault = address.isIsDefault() != null && address.isIsDefault();
        
        addressRepository.delete(address);

        // Nếu xóa địa chỉ mặc định, tự động chọn một địa chỉ khác (nếu còn) làm mặc định
        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByUserId(userId);
            if (!remainingAddresses.isEmpty()) {
                Address nextDefault = remainingAddresses.get(0);
                nextDefault.setIsDefault(true);
            }
        }
    }

    @Override
    @Transactional
    public AddressResponseDTO setDefault(Long userId, Long id) {
        Address address = addressRepository.findById(id);
        if (address == null || !address.getUser().getId().equals(userId)) {
            throw new NotFoundException("Không tìm thấy địa chỉ của bạn với ID: " + id);
        }

        if (Boolean.TRUE.equals(address.isIsDefault())) {
            return addressMapper.toDto(address); // Đã là mặc định rồi
        }

        address.setIsDefault(true);
        unsetOtherDefaults(userId, id);

        return addressMapper.toDto(address);
    }

    /**
     * Bỏ trạng thái mặc định của các địa chỉ khác của user này
     */
    private void unsetOtherDefaults(Long userId, Long excludeAddressId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (excludeAddressId == null || !addr.getId().equals(excludeAddressId)) {
                addr.setIsDefault(false);
            }
        }
    }
}
