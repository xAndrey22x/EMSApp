package com.energyDevice.controllers;

import com.energyDevice.dtos.UserRefDto;
import com.energyDevice.services.UserRefService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/userRef")
public class UserRefController {

    private final UserRefService userRefService;

    public UserRefController(UserRefService userRefService) {
        this.userRefService = userRefService;
    }

    @PostMapping()
    @Secured("ROLE_ADMIN")
    public UserRefDto addUserRef(@RequestBody final UserRefDto userRefDto) {
        return userRefService.addUserRef(userRefDto);
    }

    @PutMapping()
    @Secured("ROLE_ADMIN")
    public UserRefDto updateUserRef(@RequestBody final UserRefDto userRefDto) {
        return userRefService.updateUserRef(userRefDto);
    }

    @DeleteMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public void deleteUserRef(@PathVariable Long id) {
        userRefService.deleteUserRef(id);
    }

    @GetMapping()
    @Secured("ROLE_ADMIN")
    public List<UserRefDto> getAllUserRefs() {
        return userRefService.getAllUserRefs();
    }

    @GetMapping("/{userId}")
    @Secured("ROLE_USER")
    public ResponseEntity<?> getUserDevices(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userRefService.getUserDevices(userId));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

}
