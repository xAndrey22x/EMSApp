package com.energyDevice.dtos;

import lombok.Data;

@Data
public class DeviceDtoForList {

    private Long id;
    private String description;
    private String address;
    private Integer MHEC;

}
