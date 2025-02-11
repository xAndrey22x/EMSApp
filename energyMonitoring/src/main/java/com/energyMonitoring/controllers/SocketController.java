package com.energyMonitoring.controllers;

import com.energyMonitoring.dtos.MonitorDataDto;
import com.energyMonitoring.dtos.MonitorReceivedDto;
import com.energyMonitoring.services.MonitorService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class SocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MonitorService monitorService;
    private final Map<Long, Long> socketData = new ConcurrentHashMap<>();

    public SocketController(SimpMessagingTemplate messagingTemplate, MonitorService monitorService) {
        this.messagingTemplate = messagingTemplate;
        this.monitorService = monitorService;
    }

    @RabbitListener(queues = "sensor_data_queue")
    public void receiveMessage(MonitorReceivedDto monitorReceivedDto) {
        if (monitorService.sensorProcessing(monitorReceivedDto)) {
            pushNotification(monitorReceivedDto.getDeviceId());
        }
        if(this.socketData.containsKey(monitorReceivedDto.getDeviceId()))
            sendMonitorData(monitorReceivedDto.getDeviceId());
    }

    @MessageMapping("/monitor/connect")
    public void connectToMonitor(Long deviceId){
        this.socketData.put(deviceId, 0L);
    }

    @MessageMapping("/monitor/timestamp/{deviceId}")
    public void setMonitorTimestamp(Long timestamp, @DestinationVariable("deviceId") Long deviceId){
        this.socketData.put(deviceId, timestamp);
        sendMonitorData(deviceId);
    }

    @MessageMapping("/monitor/disconnect")
    public void disconnectMonitor(Long deviceId){
        this.socketData.remove(deviceId);
    }

    public void pushNotification(Long deviceId) {
        String message = "Device with ID " + deviceId + " has reached its maximum consumption.";
        messagingTemplate.convertAndSend("/topic/device/" + deviceId, message);
    }

    public void sendMonitorData(Long deviceId){
        Long timestamp = this.socketData.get(deviceId);
        List<MonitorDataDto> monitorDataDtoList = this.monitorService.getMonitorDataForOneDay(deviceId, timestamp);
        messagingTemplate.convertAndSend("/topic/monitor/" + deviceId, monitorDataDtoList);
    }

}
