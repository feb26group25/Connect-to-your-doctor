package com.connectdoc.repository;

import com.connectdoc.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    List<Doctor> findBySpecializationIgnoreCase(String specialization);

    @Query("SELECT d FROM Doctor d WHERE d.user.userId = :userId")
    Optional<Doctor> findByUserId(@Param("userId") Integer userId);
}
