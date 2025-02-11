package org.deviceSimulator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.github.cdimascio.dotenv.Dotenv;

import java.time.Instant;

public class DeviceSimulationTask implements Runnable{
    private final String deviceId;
    private static final String SENSOR_FILE = "sensor.csv";
    private static final String QUEUE_NAME = "sensor_data_queue";
    private static final Dotenv dotenv = Dotenv.load();

    public DeviceSimulationTask(String deviceId) {
        this.deviceId = deviceId;
    }

    @Override
    public void run() {
        try{
            SensorReader sensorReader = new SensorReader();
            sensorReader.openFile(SENSOR_FILE);
            ConnectionFactory factory = new ConnectionFactory();
            factory.setUri("amqps://" + dotenv.get("RABBITMQ_USERNAME") + ":" + dotenv.get("RABBITMQ_PASSWORD") +"@" + dotenv.get("RABBITMQ_HOST") + "/" + dotenv.get("RABBITMQ_VHOST"));
            try (Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {

                channel.queueDeclare(QUEUE_NAME, false, false, false, null);

                ObjectMapper objectMapper = new ObjectMapper();

                Double measurement;
                long powerMinutes = 0;
                while ((measurement = sensorReader.readNextMeasurement()) != null) {
                    long timestamp = Instant.now().toEpochMilli() + powerMinutes;

                    SensorDto message = new SensorDto(timestamp, deviceId, measurement);
                    String jsonMessage = objectMapper.writeValueAsString(message);

                    channel.basicPublish("", QUEUE_NAME, null, jsonMessage.getBytes());

                    Thread.sleep(10000); // 10 seconds (change to 10 minutes for production)
                    powerMinutes += 1200000; // 20 minutes for testing purposes
                }
            } finally {
                sensorReader.closeFile();
            }
        } catch (Exception e) {
            System.out.println("An error occurred: " + e.getMessage());
        }
    }

}
