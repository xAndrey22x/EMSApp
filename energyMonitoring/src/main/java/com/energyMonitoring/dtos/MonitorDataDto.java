package com.energyMonitoring.dtos;

import lombok.Data;

@Data
public class MonitorDataDto {

    private Long id;
    private Long timestamp;
    private Double measurementValueHourly;

}
