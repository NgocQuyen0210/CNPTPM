package com.phong.it.service;

import java.util.List;

import com.phong.it.dto.request.UserRegisterRequestDTO;
import com.phong.it.dto.response.UserResponseDTO;

public interface UserService {

    List<UserResponseDTO> getAllUsers(int page, int size);

    UserResponseDTO getUserById(Long id);

    UserResponseDTO createUser(UserRegisterRequestDTO requestDTO);

    UserResponseDTO updateUser(Long id, UserRegisterRequestDTO requestDTO);

    void deleteUser(Long id);

    UserResponseDTO login(String username, String password);
}

