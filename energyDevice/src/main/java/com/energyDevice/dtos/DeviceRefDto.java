package com.energyDevice.dtos;

import com.energyDevice.utils.enums.DataBaseOperation;
import lombok.Data;

@Data
public class DeviceRefDto {

    private Long deviceId;
    private Integer MHEC;
    private DataBaseOperation operation;

}
