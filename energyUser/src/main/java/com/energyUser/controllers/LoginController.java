package com.energyUser.controllers;

import com.energyUser.config.security.JwtUtil;
import com.energyUser.dtos.UserLoginDto;
import com.energyUser.services.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/login")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService, JwtUtil jwtUtil) {
        this.loginService = loginService;
    }

    @PostMapping()
    public ResponseEntity<?> login(@RequestBody UserLoginDto userLoginDto) {
        try {
            String token = loginService.loginUser(userLoginDto);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

}
