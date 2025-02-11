package com.energyDevice.mappers;

import com.energyDevice.dtos.UserRefDto;
import com.energyDevice.entities.UserRefEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserRefMapper {

    UserRefDto entityToDto(UserRefEntity userRefEntity);

    UserRefEntity dtoToEntity(UserRefDto userRefDto);

    List<UserRefDto> entityListToDtoList(List<UserRefEntity> userRefEntities);

    List<UserRefEntity> dtoListToEntityList(List<UserRefDto> userRefDtos);


}
