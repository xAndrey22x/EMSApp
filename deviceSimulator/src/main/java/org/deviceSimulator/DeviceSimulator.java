package org.deviceSimulator;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class DeviceSimulator {

    private static final String CONFIG_FILE = "config.properties";

    public static void main(String[] args) {
        try{
            List<String> deviceIds = loadDevicesId();

            ExecutorService executor = Executors.newFixedThreadPool(deviceIds.size());

            for (String deviceId : deviceIds) {
                executor.execute(new DeviceSimulationTask(deviceId));
            }
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                executor.shutdown();
                try {
                    if (!executor.awaitTermination(3, TimeUnit.SECONDS)) {
                        executor.shutdownNow();
                    }
                } catch (InterruptedException e) {
                    executor.shutdownNow();
                }
            }));
        } catch (Exception e) {
            System.err.println("An error occurred: " + e.getMessage());
        }
    }

    private static List<String> loadDevicesId() throws Exception {
        java.util.Properties props = new java.util.Properties();
        try (InputStream input = DeviceSimulator.class.getClassLoader().getResourceAsStream(CONFIG_FILE)) {
            props.load(input);
            String deviceIds = props.getProperty("device_ids");
            if (deviceIds != null) {
                return Arrays.asList(deviceIds.split(","));
            } else {
                throw new Exception("No device_ids found in the configuration file.");
            }
        }
    }
}