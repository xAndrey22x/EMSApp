package com.energyUser.services;

import com.energyUser.config.security.JwtUtil;
import com.energyUser.dtos.UserInfoDto;
import com.energyUser.dtos.UserLoginDto;
import com.energyUser.entities.UserEntity;
import com.energyUser.mappers.UserMapper;
import com.energyUser.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LoginService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String loginUser(UserLoginDto userLoginDto) {

        if (checkUserLogin(userLoginDto.getName(), userLoginDto.getPassword())) {
            UserInfoDto userInfo = userMapper.entityToDto(userRepository.findByName(userLoginDto.getName()));
            return jwtUtil.generateToken(userInfo);
        } else throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login credentials");

    }

    public boolean checkUserLogin(String name, String password) {
        UserEntity user = userRepository.findByName(name);
        return user != null && passwordEncoder.matches(password, user.getPassword());
    }

}
