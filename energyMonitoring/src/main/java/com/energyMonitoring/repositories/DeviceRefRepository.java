package com.energyMonitoring.repositories;

import com.energyMonitoring.entities.DeviceRefEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRefRepository extends JpaRepository<DeviceRefEntity, Long> {
}
