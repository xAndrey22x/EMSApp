package com.energyDevice.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Table(name = "user_ref")
@Entity
@Data
public class UserRefEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @OneToMany(mappedBy = "userRef", cascade = CascadeType.DETACH)
    private List<DeviceEntity> devices = new ArrayList<>();

    public void addDevice(DeviceEntity device) {
        devices.add(device);
        device.setUserRef(this);
    }

    public void removeDevice(DeviceEntity device) {
        devices.remove(device);
        device.setUserRef(null);
    }

}
