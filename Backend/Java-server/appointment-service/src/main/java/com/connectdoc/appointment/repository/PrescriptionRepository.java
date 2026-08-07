package com.connectdoc.appointment.repository;

import com.connectdoc.appointment.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {

    @Query("SELECT p FROM Prescription p WHERE p.appointment.appointmentId = :appointmentId")
    Optional<Prescription> findByAppointmentId(@Param("appointmentId") Integer appointmentId);

    @Query("SELECT p FROM Prescription p WHERE p.appointment.patientId = :patientId")
    List<Prescription> findByPatientId(@Param("patientId") Integer patientId);
}
