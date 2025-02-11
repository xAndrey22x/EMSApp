package com.energyDevice.mappers;

import com.energyDevice.dtos.DeviceDto;
import com.energyDevice.dtos.DeviceDtoForList;
import com.energyDevice.dtos.DeviceRefDto;
import com.energyDevice.entities.DeviceEntity;
import jakarta.persistence.Column;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DeviceMapper {

    DeviceDto entityToDto(DeviceEntity deviceEntity);

    DeviceEntity dtoToEntity(DeviceDto deviceDto);

    List<DeviceDto> entityListToDtoList(List<DeviceEntity> deviceEntities);

    List<DeviceEntity> dtoListToEntityList(List<DeviceDto> deviceDtos);

    DeviceDtoForList entityToDeviceDtoForList(DeviceEntity deviceEntity);

    List<DeviceDtoForList> entityListToDeviceDtoForList(List<DeviceEntity> deviceEntities);

    @Mapping(target = "deviceId", source = "id")
    DeviceRefDto entityToDeviceRefDto(DeviceEntity deviceEntity);

    @Mapping(target = "id", source = "deviceId")
    DeviceEntity refDtoToEntity(DeviceRefDto deviceRefDto);

}
