package com.energyDevice.controllers;

import com.energyDevice.dtos.DeviceDto;
import com.energyDevice.services.DeviceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping()
    @Secured("ROLE_ADMIN")
    public List<DeviceDto> getAllDevices() {
        return deviceService.getAllDevices();
    }

    @PostMapping()
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> addDevice(@RequestBody final DeviceDto deviceDto) {
        try {
            return ResponseEntity.ok(deviceService.addDevice(deviceDto));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> updateDevice(@PathVariable final Long id, @RequestBody final DeviceDto deviceDto) {
        try {
            return ResponseEntity.ok(deviceService.updateDevice(id, deviceDto));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public void deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
    }

    @PutMapping("/assign/{deviceId}/{userId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> assignDevice(@PathVariable final Long deviceId, @PathVariable final Long userId) {
        try {
            return ResponseEntity.ok(deviceService.addDeviceUser(deviceId, userId));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/unassign/{deviceId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<?> unassignDevice(@PathVariable final Long deviceId) {
        try {
            return ResponseEntity.ok(deviceService.removeDeviceUser(deviceId));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
