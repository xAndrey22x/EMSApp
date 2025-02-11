package com.energyMonitoring.repositories;

import com.energyMonitoring.entities.DeviceRefEntity;
import com.energyMonitoring.entities.MonitorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonitorRepository extends JpaRepository<MonitorEntity, Long> {

    Optional<MonitorEntity> findByTimestampAndDeviceRef(Long timestamp, DeviceRefEntity deviceRefEntity);

    List<MonitorEntity> findByDeviceRefAndTimestampBetweenOrderById(DeviceRefEntity deviceRefEntity, Long startTimestamp, Long endTimestamp);

}
