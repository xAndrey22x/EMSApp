package com.energyDevice.services;

import com.energyDevice.dtos.DeviceDto;
import com.energyDevice.dtos.DeviceRefDto;
import com.energyDevice.entities.DeviceEntity;
import com.energyDevice.entities.UserRefEntity;
import com.energyDevice.mappers.DeviceMapper;
import com.energyDevice.repositories.DeviceRepository;
import com.energyDevice.repositories.UserRefRepository;
import com.energyDevice.utils.enums.DataBaseOperation;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UserRefRepository userRefRepository;
    private final DeviceMapper deviceMapper;
    private final RabbitTemplate rabbitTemplate;
    private final String queueName = "device_data_queue";


    public DeviceService(DeviceRepository deviceRepository, UserRefRepository userRefRepository, DeviceMapper deviceMapper, RabbitTemplate rabbitTemplate) {
        this.deviceRepository = deviceRepository;
        this.userRefRepository = userRefRepository;
        this.deviceMapper = deviceMapper;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional(readOnly = true)
    public List<DeviceDto> getAllDevices() {
        return deviceMapper.entityListToDtoList(deviceRepository.findAll(Sort.by(Sort.Direction.ASC, "id")));
    }

    @Transactional
    public DeviceDto addDevice(DeviceDto deviceDto) {
        DeviceEntity deviceEntity = deviceMapper.dtoToEntity(deviceDto);

        DeviceEntity savedDevice = deviceRepository.save(deviceEntity);

        if (deviceDto.getUserRef() != null && deviceDto.getUserRef().getUserId() != null) {
            addDeviceUser(savedDevice.getId(), deviceDto.getUserRef().getUserId());
        }

        DeviceRefDto deviceRefDto = deviceMapper.entityToDeviceRefDto(savedDevice);
        deviceRefDto.setOperation(DataBaseOperation.ADD);
        rabbitTemplate.convertAndSend(queueName, deviceRefDto);

        return deviceMapper.entityToDto(savedDevice);
    }

    @Transactional
    public DeviceDto updateDevice(Long id, DeviceDto deviceDto) {
        DeviceEntity device = deviceRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND ,"Device with ID " + id + " not found."));

        device.setDescription(deviceDto.getDescription());
        device.setAddress(deviceDto.getAddress());
        device.setMHEC(deviceDto.getMHEC());

        DeviceRefDto deviceRefDto = deviceMapper.entityToDeviceRefDto(device);
        deviceRefDto.setOperation(DataBaseOperation.UPDATE);
        rabbitTemplate.convertAndSend(queueName, deviceRefDto);


        return deviceMapper.entityToDto(deviceRepository.save(device));
    }

    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);

        DeviceRefDto deviceRefDto = new DeviceRefDto();
        deviceRefDto.setDeviceId(id);
        deviceRefDto.setOperation(DataBaseOperation.DELETE);
        rabbitTemplate.convertAndSend(queueName, deviceRefDto);

    }

    @Transactional
    public DeviceDto addDeviceUser(Long deviceId, Long userId) {
        DeviceEntity device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device with ID " + deviceId + " not found."));

        UserRefEntity userRef = userRefRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + userId + " not found."));

        userRef.addDevice(device);

        return deviceMapper.entityToDto(deviceRepository.save(device));
    }


    @Transactional
    public DeviceDto removeDeviceUser(Long deviceId) {
        DeviceEntity device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device with ID " + deviceId + " not found."));

        UserRefEntity userRef = device.getUserRef();
        if(userRef != null)
            userRef.removeDevice(device);

        return deviceMapper.entityToDto(deviceRepository.save(device));
    }


}
