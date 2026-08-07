package com.connectdoc.doctor.repository;

import com.connectdoc.doctor.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Integer> {

    @Query("SELECT a FROM Availability a WHERE a.doctor.doctorId = :doctorId")
    List<Availability> findByDoctorDoctorId(@Param("doctorId") Integer doctorId);
}
