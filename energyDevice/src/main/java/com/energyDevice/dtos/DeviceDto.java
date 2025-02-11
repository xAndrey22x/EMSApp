package com.energyDevice.dtos;

import lombok.Data;

@Data
public class DeviceDto {

    private Long id;
    private String description;
    private String address;
    private Integer MHEC;
    private UserRefDto userRef;

}
