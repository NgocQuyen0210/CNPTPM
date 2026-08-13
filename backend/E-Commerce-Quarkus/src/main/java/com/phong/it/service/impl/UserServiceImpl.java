package com.phong.it.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import com.phong.it.dto.request.UserRegisterRequestDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.entity.Cart;
import com.phong.it.entity.Role;
import com.phong.it.entity.User;
import com.phong.it.mapper.UserMapper;
import com.phong.it.repository.RoleRepository;
import com.phong.it.repository.UserRepository;
import com.phong.it.service.UserService;

import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class UserServiceImpl implements UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    RoleRepository roleRepository;

    @Inject
    UserMapper userMapper;

    @Override
    public List<UserResponseDTO> getAllUsers(int page, int size) {
        PanacheQuery<User> query = userRepository.findAll().page(page, size);
        return query.stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Người dùng không tồn tại", Status.NOT_FOUND));
        return userMapper.toResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRegisterRequestDTO requestDTO) {
        // Kiểm tra xem username đã tồn tại trong hệ thống chưa
        if (userRepository.findByUsername(requestDTO.username()) != null) {
            throw new WebApplicationException("Username đã được sử dụng", Status.BAD_REQUEST);
        }
        
        // Kiểm tra xem email đã tồn tại chưa
        if (requestDTO.email() != null && userRepository.findByEmail(requestDTO.email()) != null) {
            throw new WebApplicationException("Email đã được sử dụng", Status.BAD_REQUEST);
        }

        // Kiểm tra mật khẩu và mật khẩu xác nhận
        if (!requestDTO.password().equals(requestDTO.confirmPassword())) {
            throw new WebApplicationException("Mật khẩu xác nhận không khớp", Status.BAD_REQUEST);
        }

        // Chuyển đổi từ DTO sang Entity
        User user = userMapper.toEntity(requestDTO);
        
        // Mã hóa mật khẩu sử dụng Bcrypt
        user.setPassword(BcryptUtil.bcryptHash(requestDTO.password()));

        // Tìm Role 'USER' để gán mặc định cho người dùng mới
        Role userRole = roleRepository.findByName("USER");
        if (userRole != null) {
            user.getRoles().add(userRole);
        } else {
            throw new WebApplicationException("Role 'USER' không tồn tại trong hệ thống", Status.INTERNAL_SERVER_ERROR);
        }

        // Khởi tạo một Cart mới và gắn cho User
        Cart cart = new Cart();
        cart.setUser(user);
        user.setCart(cart);
        
        // Lưu vào DB
        userRepository.persist(user);
        
        return userMapper.toResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserRegisterRequestDTO requestDTO) {
        User existingUser = userRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Người dùng không tồn tại", Status.NOT_FOUND));

        // Nếu thay đổi username, kiểm tra xem username mới đã tồn tại chưa
        if (!existingUser.getUsername().equals(requestDTO.username())) {
            if (userRepository.findByUsername(requestDTO.username()) != null) {
                throw new WebApplicationException("Username đã được sử dụng", Status.BAD_REQUEST);
            }
            existingUser.setUsername(requestDTO.username());
        }

        // Tương tự với email
        if (requestDTO.email() != null && !requestDTO.email().equals(existingUser.getEmail())) {
            if (userRepository.findByEmail(requestDTO.email()) != null) {
                throw new WebApplicationException("Email đã được sử dụng", Status.BAD_REQUEST);
            }
            existingUser.setEmail(requestDTO.email());
        }

        // Cập nhật thông tin cơ bản
        existingUser.setFullName(requestDTO.fullName());
        
        // Cập nhật mật khẩu nếu có gửi lên
        if (requestDTO.password() != null && !requestDTO.password().trim().isEmpty()) {
            if (!requestDTO.password().equals(requestDTO.confirmPassword())) {
                throw new WebApplicationException("Mật khẩu xác nhận không khớp", Status.BAD_REQUEST);
            }
            existingUser.setPassword(BcryptUtil.bcryptHash(requestDTO.password()));
        }

        // Repository Panache sẽ tự cập nhật khi commit transaction
        return userMapper.toResponseDTO(existingUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User existingUser = userRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Người dùng không tồn tại", Status.NOT_FOUND));
        
        userRepository.delete(existingUser);
    }

    @Override
    public UserResponseDTO login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new WebApplicationException("Tên đăng nhập hoặc mật khẩu không chính xác", Status.UNAUTHORIZED);
        }

        if (!BcryptUtil.matches(password, user.getPassword())) {
            throw new WebApplicationException("Tên đăng nhập hoặc mật khẩu không chính xác", Status.UNAUTHORIZED);
        }

        return userMapper.toResponseDTO(user);
    }
}

