package com.energyChat.controllers;

import com.energyChat.dtos.MessageDto;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public SocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat")
    public void receiveMessage(MessageDto messageDto) {
        sendMessage(messageDto);
    }

    public void sendMessage(MessageDto messageDto) {
        this.messagingTemplate.convertAndSend("/topic/chat/" + messageDto.getSenderId() + "/" + messageDto.getReceiverId(), messageDto);
    }

    @MessageMapping("/seen/{senderId}")
    public void seenMessage(Long receiverId, @DestinationVariable("senderId") Long senderId) {
        sendSeenMessage(senderId, receiverId);
    }

    public void sendSeenMessage(Long senderId, Long receiverId) {
        this.messagingTemplate.convertAndSend("/topic/seen/" + senderId, receiverId);
    }

    @MessageMapping("/typing/{receiverId}")
    public void typingNotification(@DestinationVariable("receiverId") Long receiverId, Long senderId) {
        this.messagingTemplate.convertAndSend("/topic/typing/" + receiverId, senderId);
    }


}
