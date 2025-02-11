package com.energyMonitoring.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name = "device_ref")
@Entity
@Data
public class DeviceRefEntity {

    @Id
    @Column(name = "device_id")
    private Long deviceId;

    @Column(name = "mhec", nullable = false)
    private Integer MHEC;

}
