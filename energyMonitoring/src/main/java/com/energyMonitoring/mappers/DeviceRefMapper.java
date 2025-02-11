package com.energyMonitoring.mappers;

import com.energyMonitoring.dtos.DeviceRefDto;
import com.energyMonitoring.entities.DeviceRefEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DeviceRefMapper {

    DeviceRefDto entityToDto(DeviceRefEntity deviceRefEntity);

    DeviceRefEntity dtoToEntity(DeviceRefDto deviceRefDto);

}
