package org.deviceSimulator;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SensorDto {
    private Long timestamp;
    private String deviceId;
    private Double measurementValue;
}
