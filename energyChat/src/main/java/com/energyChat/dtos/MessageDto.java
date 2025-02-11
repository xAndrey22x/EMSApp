package com.energyChat.dtos;

import lombok.Data;


@Data
public class MessageDto {

    private Long senderId;
    private Long receiverId;
    private String message;
    private String announcerName;
    private boolean seen;

}
