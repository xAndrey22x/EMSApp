package com.energyUser.repositories;

import com.energyUser.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    boolean existsByName(String name);

    long countByName(String name);

    UserEntity findByName(String name);

    List<UserEntity> findAllByAdmin(boolean admin);

}
