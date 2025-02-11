package com.energyDevice.services;

import com.energyDevice.dtos.DeviceDtoForList;
import com.energyDevice.dtos.UserRefDto;
import com.energyDevice.entities.DeviceEntity;
import com.energyDevice.entities.UserRefEntity;
import com.energyDevice.mappers.DeviceMapper;
import com.energyDevice.mappers.UserRefMapper;
import com.energyDevice.repositories.UserRefRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class UserRefService {

    private final UserRefRepository userRefRepository;
    private final UserRefMapper userRefMapper;
    private final DeviceMapper deviceMapper;

    public UserRefService(UserRefRepository userRefRepository, UserRefMapper userRefMapper, DeviceMapper deviceMapper) {
        this.userRefRepository = userRefRepository;
        this.userRefMapper = userRefMapper;
        this.deviceMapper = deviceMapper;
    }

    public UserRefDto addUserRef(UserRefDto userRefDto) {
        return userRefMapper.entityToDto(userRefRepository.save(userRefMapper.dtoToEntity(userRefDto)));
    }

    public UserRefDto updateUserRef(UserRefDto userRefDto) {
        return userRefMapper.entityToDto(userRefRepository.save(userRefMapper.dtoToEntity(userRefDto)));
    }

    @Transactional
    public void deleteUserRef(Long id) {
        if(userRefRepository.existsById(id)) {
            Optional<UserRefEntity> user = userRefRepository.findById(id);
            user.ifPresent(userRefEntity -> userRefEntity.getDevices().forEach(device -> device.setUserRef(null)));
        }
        userRefRepository.deleteById(id);
    }

    @Transactional
    public List<DeviceDtoForList> getUserDevices(Long userId) {
        UserRefEntity user = userRefRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + userId + " not found."));
        return deviceMapper.entityListToDeviceDtoForList(user.getDevices().stream().sorted(Comparator.comparing(DeviceEntity::getId)).toList());
    }

    public List<UserRefDto> getAllUserRefs() {
        return userRefMapper.entityListToDtoList(userRefRepository.findAll());
    }

}
