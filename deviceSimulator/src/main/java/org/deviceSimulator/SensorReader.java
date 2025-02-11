package org.deviceSimulator;


import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class SensorReader {
    private BufferedReader reader;

    public void openFile(String filePath) throws IOException {
        reader = new BufferedReader(new FileReader(filePath));
    }

    public Double readNextMeasurement() throws IOException {
        String line = reader.readLine();
        if (line != null) {
            return Double.parseDouble(line);
        }
        return null;
    }

    public void closeFile() throws IOException {
        if (reader != null) {
            reader.close();
        }
    }


}
