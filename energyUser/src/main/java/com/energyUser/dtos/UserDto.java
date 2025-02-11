package com.energyUser.dtos;

import lombok.Data;

@Data
public class UserDto {

        private Long id;
        private String name;
        private String password;
        private boolean admin;

}
