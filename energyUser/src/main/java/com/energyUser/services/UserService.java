package com.energyUser.services;

import com.energyUser.dtos.UserDto;
import com.energyUser.dtos.UserInfoDto;
import com.energyUser.dtos.UserRefDto;
import com.energyUser.entities.UserEntity;
import com.energyUser.mappers.UserMapper;
import com.energyUser.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    @Value("${external-service.base-url}")
    private String externalServiceBaseUrl;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    @Transactional
    public void init() {
        if (userRepository.count() == 0) {
            UserEntity user = new UserEntity();
            user.setName("admin");
            user.setPassword(passwordEncoder.encode("123"));
            user.setAdmin(true);
            userRepository.save(user);
        }
    }

    public List<UserInfoDto> getAllUsers() {
        return userMapper.entityListToDtoList(userRepository.findAll(Sort.by(Sort.Direction.ASC, "id")));
    }

    public String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalStateException("JWT Token not found in request headers");
    }

    @Transactional
    public UserInfoDto addUser(UserDto userDto, String token) {
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));

        UserEntity userEntity = userMapper.dotToEntity(userDto);

        if (checkUserExists(userEntity.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with name " + userEntity.getName() + " already exists.");
        }

        UserEntity savedUser = userRepository.save(userEntity);
        if (!savedUser.isAdmin()) {
            UserRefDto userRefDto = new UserRefDto();
            userRefDto.setUserId(savedUser.getId());
            userRefDto.setUserName(savedUser.getName());

            try {
                addUserRefToExternalService(userRefDto, token);
            } catch (WebClientException e) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "No connection to Device Microservice", e);
            }
        }

        return userMapper.entityToDto(savedUser);
    }

    @Transactional
    public UserInfoDto updateUser(Long id, UserDto userDto, String token) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found."));
        if (!userDto.getPassword().isEmpty())
            userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        if (checkUserUpdateName(userDto.getName()) && !user.getName().equals(userDto.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with name " + userDto.getName() + " already exists.");
        }
        user.setName(userDto.getName());
        if (!userDto.getPassword().isEmpty())
            user.setPassword(userDto.getPassword());

        boolean noUpdate = true;
        UserRefDto userRefDto = new UserRefDto();
        userRefDto.setUserId(user.getId());
        userRefDto.setUserName(user.getName());

        if (!user.isAdmin() && userDto.isAdmin())
            try {
                noUpdate = false;
                deleteUserRefToExternalService(id, token);
            } catch (WebClientException e) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "No connection to Device Microservice", e);
            }
        else if (user.isAdmin() && !userDto.isAdmin())
            try {
                noUpdate = false;
                addUserRefToExternalService(userRefDto, token);
            } catch (WebClientException e) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "No connection to Device Microservice", e);
            }

        user.setAdmin(userDto.isAdmin());

        if (noUpdate)
            try {
                updateUserRefToExternalService(userRefDto, token);
            } catch (WebClientException e) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "No connection to Device Microservice", e);
            }

        return userMapper.entityToDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, String token) {
        userRepository.deleteById(id);
        try {
            deleteUserRefToExternalService(id, token);
        } catch (WebClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No connection to Device Microservice", e);
        }
    }

    private void addUserRefToExternalService(UserRefDto userRefDto, String token) {
        WebClient webClient = WebClient.builder()
                .baseUrl(externalServiceBaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();

        webClient.post()
                .uri("/userRef")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(userRefDto), UserRefDto.class)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    private void deleteUserRefToExternalService(Long id, String token) {
        WebClient webClient = WebClient.builder()
                .baseUrl(externalServiceBaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();

        webClient.delete()
                .uri("/userRef/" + id)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    private void updateUserRefToExternalService(UserRefDto userRefDto, String token) {
        WebClient webClient = WebClient.builder()
                .baseUrl(externalServiceBaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();

        webClient.put()
                .uri("/userRef")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(userRefDto), UserRefDto.class)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public boolean checkUserExists(String name) {
        return userRepository.existsByName(name);
    }

    public boolean checkUserUpdateName(String name) {
        return userRepository.countByName(name) >= 1;
    }

    public List<UserInfoDto> getAllUsersRoleUser() {
        List<UserEntity> users = userRepository.findAllByAdmin(false);
        return userMapper.entityListToDtoList(users);
    }

    public List<UserInfoDto> getAllUsersRoleAdmin() {
        List<UserEntity> users = userRepository.findAllByAdmin(true);
        return userMapper.entityListToDtoList(users);
    }

}
