package com.energyMonitoring.services;

import com.energyMonitoring.dtos.DeviceRefDto;
import com.energyMonitoring.entities.DeviceRefEntity;
import com.energyMonitoring.mappers.DeviceRefMapper;
import com.energyMonitoring.repositories.DeviceRefRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DeviceService {

    private final DeviceRefRepository deviceRefRepository;
    private final DeviceRefMapper deviceRefMapper;

    public DeviceService(DeviceRefRepository deviceRefRepository, DeviceRefMapper deviceRefMapper) {
        this.deviceRefRepository = deviceRefRepository;
        this.deviceRefMapper = deviceRefMapper;
    }

    @RabbitListener(queues = "device_data_queue")
    public void deviceListener(DeviceRefDto deviceDto) {
        System.out.println("Received Message from Device Microservice: " + deviceDto);
        switch (deviceDto.getOperation()){
            case ADD:
                addDevice(deviceDto);
                break;
            case DELETE:
                deleteDevice(deviceDto.getDeviceId());
                break;
            case UPDATE:
                updateDevice(deviceDto);
                break;
            default:
                System.out.println("Invalid operation");
                break;
        }
    }

    public void addDevice(DeviceRefDto deviceDto) {
        this.deviceRefRepository.save(this.deviceRefMapper.dtoToEntity(deviceDto));
    }

    public void deleteDevice(Long id) {
        this.deviceRefRepository.deleteById(id);
    }

    public void updateDevice(DeviceRefDto deviceDto) {
        Optional<DeviceRefEntity> deviceRefEntity = this.deviceRefRepository.findById(deviceDto.getDeviceId());

        if(deviceRefEntity.isPresent()){
            DeviceRefEntity deviceRef = deviceRefEntity.get();
            deviceRef.setMHEC(deviceDto.getMHEC());
            deviceRefRepository.save(deviceRef);
        }

    }


}
