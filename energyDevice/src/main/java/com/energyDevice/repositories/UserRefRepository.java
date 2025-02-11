package com.energyDevice.repositories;

import com.energyDevice.entities.UserRefEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRefRepository extends JpaRepository<UserRefEntity, Long> {

}
