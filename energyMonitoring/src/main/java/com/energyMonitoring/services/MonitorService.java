package com.energyMonitoring.services;

import com.energyMonitoring.dtos.MonitorDataDto;
import com.energyMonitoring.dtos.MonitorReceivedDto;
import com.energyMonitoring.entities.DeviceRefEntity;
import com.energyMonitoring.entities.MonitorEntity;
import com.energyMonitoring.mappers.MonitorMapper;
import com.energyMonitoring.repositories.DeviceRefRepository;
import com.energyMonitoring.repositories.MonitorRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class MonitorService {

    private final MonitorRepository monitorRepository;
    private final DeviceRefRepository deviceRefRepository;
    private final MonitorMapper monitorMapper;

    public MonitorService(MonitorRepository monitorRepository, DeviceRefRepository deviceRefRepository, MonitorMapper monitorMapper) {
        this.monitorRepository = monitorRepository;
        this.deviceRefRepository = deviceRefRepository;
        this.monitorMapper = monitorMapper;
    }

    public boolean sensorProcessing(MonitorReceivedDto monitorReceivedDto) {
        System.out.println("Received Message from Device Simulator: " + monitorReceivedDto);
        LocalDateTime localDateTimeReceived = Instant.ofEpochMilli(monitorReceivedDto.getTimestamp())
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        int day = localDateTimeReceived.getDayOfMonth();
        int month = localDateTimeReceived.getMonthValue();
        int year = localDateTimeReceived.getYear();
        int hour = localDateTimeReceived.getHour();

        LocalDateTime localDateTimeSaved = LocalDateTime.of(year, month, day, hour, 0, 0);

        long timestampSaved = localDateTimeSaved
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

        Long deviceId = monitorReceivedDto.getDeviceId();
        Optional<DeviceRefEntity> deviceRefEntity = deviceRefRepository.findById(monitorReceivedDto.getDeviceId());
        if(deviceRefEntity.isPresent()){

        Optional<MonitorEntity> monitorEntityOptional = monitorRepository.findByTimestampAndDeviceRef(timestampSaved, deviceRefEntity.get());

        MonitorEntity monitorEntity;

        if (monitorEntityOptional.isPresent()) {
            monitorEntity = monitorEntityOptional.get();
            monitorEntity.setMeasurementValueHourly(monitorEntity.getMeasurementValueHourly() + monitorReceivedDto.getMeasurementValue());
        } else {
            monitorEntity = new MonitorEntity();
            monitorEntity.setTimestamp(timestampSaved);
            monitorEntity.setMeasurementValueHourly(monitorReceivedDto.getMeasurementValue());

            monitorEntity.setDeviceRef(deviceRefEntity.get());

        }
            monitorRepository.save(monitorEntity);
            return monitorEntity.getMeasurementValueHourly() > deviceRefEntity.get().getMHEC();
        }

        return false;

    }

    public List<MonitorDataDto> getMonitorDataForOneDay(Long deviceId, Long timestampDay){
        LocalDateTime startOfDayLocal = Instant.ofEpochMilli(timestampDay)
                .atZone(ZoneId.systemDefault())
                .toLocalDate()
                .atStartOfDay();

        LocalDateTime endOfDayLocal = startOfDayLocal.plusDays(1).minusNanos(1);

        long startOfDay = startOfDayLocal.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endOfDay = endOfDayLocal.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        Optional<DeviceRefEntity> deviceRef = deviceRefRepository.findById(deviceId);

        if(deviceRef.isPresent()){
            List<MonitorEntity> monitorEntities = this.monitorRepository.findByDeviceRefAndTimestampBetweenOrderById(deviceRef.get(), startOfDay, endOfDay);
            return monitorMapper.entityListToDtoList(monitorEntities);
        }
        else return Collections.emptyList();
    }

}
