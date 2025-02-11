package com.energyMonitoring.mappers;

import com.energyMonitoring.dtos.MonitorDataDto;
import com.energyMonitoring.entities.MonitorEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MonitorMapper {

    MonitorDataDto entityToDto(MonitorEntity monitorEntity);

    MonitorEntity dtoToEntity(MonitorDataDto monitorDataDto);

    List<MonitorDataDto> entityListToDtoList(List<MonitorEntity> monitorEntities);

    List<MonitorEntity> dtoListToEntityList(List<MonitorDataDto> monitorDataDtos);

}
