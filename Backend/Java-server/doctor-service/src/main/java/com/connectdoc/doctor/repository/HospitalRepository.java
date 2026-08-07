package com.connectdoc.doctor.repository;

import com.connectdoc.doctor.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Integer> {
    Optional<Hospital> findByHospitalName(String hospitalName);
}
