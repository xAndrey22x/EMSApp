package com.energyMonitoring.dtos;

import lombok.Data;

@Data
public class MonitorReceivedDto {
    private Long timestamp;
    private Long deviceId;
    private Double measurementValue;
}
