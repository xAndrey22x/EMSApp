package com.energyUser.controllers;

import com.energyUser.dtos.UserDto;
import com.energyUser.dtos.UserInfoDto;
import com.energyUser.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    @Secured("ROLE_ADMIN")
    public List<UserInfoDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/all")
    @Secured("ROLE_ADMIN")
    public List<UserInfoDto> getAllUsersRoleUser() {
        return userService.getAllUsersRoleUser();
    }

    @GetMapping("/admins/all")
    @Secured("ROLE_USER")
    public List<UserInfoDto> getAllUsersRoleAdmin() {
        return userService.getAllUsersRoleAdmin();
    }

    @PostMapping
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> addUser(@RequestBody final UserDto userDto, HttpServletRequest request) {
        try {
            String token = userService.extractTokenFromRequest(request);
            return ResponseEntity.ok(userService.addUser(userDto, token));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> updateUser(@PathVariable final Long id, @RequestBody final UserDto userDto, HttpServletRequest request) {
        try {
            String token = userService.extractTokenFromRequest(request);
            return ResponseEntity.ok(userService.updateUser(id, userDto, token));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        try {
            String token = userService.extractTokenFromRequest(request);
            userService.deleteUser(id, token);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

}
