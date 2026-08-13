package com.phong.it.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.phong.it.dto.request.UserRegisterRequestDTO;
import com.phong.it.dto.response.UserResponseDTO;
import com.phong.it.entity.Role;
import com.phong.it.entity.User;

@Mapper(componentModel = "cdi", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    // MapStruct sáº½ tá»± Ä‘á»™ng gá»i hÃ m mapRoleToString bÃªn dÆ°á»›i Ä‘á»ƒ map Set<Role> sang Set<String>
    UserResponseDTO toResponseDTO(User user);

    // Thuá»™c tÃ­nh confirmPassword náº±m á»Ÿ Source (DTO), vÃ  Target (User) khÃ´ng cÃ³ thuá»™c tÃ­nh nÃ y 
    // nÃªn MapStruct sáº½ tá»± Ä‘á»™ng bá» qua mÃ  khÃ´ng gÃ¢y lá»—i.
    User toEntity(UserRegisterRequestDTO dto);

    // HÃ m phá»¥ trá»£ giÃºp MapStruct biáº¿t cÃ¡ch chuyá»ƒn tá»« Object Role sang String
    default String mapRoleToString(Role role) {
        if (role == null) {
            return null;
        }
        return role.getName();
    }
}

