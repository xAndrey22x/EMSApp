package com.energyDevice.entities;

import jakarta.persistence.*;
import lombok.Data;

@Table(name = "device")
@Entity
@Data
public class DeviceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "mhec", nullable = false)
    private Integer MHEC;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserRefEntity userRef;

    public void setUserRef(UserRefEntity userRef) {
        this.userRef = userRef;
        if (userRef != null && !userRef.getDevices().contains(this)) {
            userRef.getDevices().add(this);
        }
    }

}
