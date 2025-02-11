package com.energyMonitoring.dtos;

import com.energyMonitoring.utils.enums.DataBaseOperation;
import lombok.Data;

@Data
public class DeviceRefDto {

    private Long deviceId;
    private Integer MHEC;
    private DataBaseOperation operation;

}
