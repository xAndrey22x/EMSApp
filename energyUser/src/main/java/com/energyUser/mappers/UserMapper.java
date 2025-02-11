package com.energyUser.mappers;

import com.energyUser.dtos.UserDto;
import com.energyUser.dtos.UserInfoDto;
import com.energyUser.entities.UserEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserInfoDto entityToDto(UserEntity userEntity);

    UserEntity dotToEntity(UserDto userDto);

    List<UserInfoDto> entityListToDtoList(List<UserEntity> userEntities);

    List<UserEntity> dtoListToEntityList(List<UserDto> userDtos);


}
