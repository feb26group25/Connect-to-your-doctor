package com.connectdoc.doctor.repository;

import com.connectdoc.doctor.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    List<Doctor> findBySpecializationIgnoreCase(String specialization);
    Optional<Doctor> findByUserId(Integer userId);
    long count();
}
