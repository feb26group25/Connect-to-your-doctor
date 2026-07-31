package com.connectdoc.repository;

import com.connectdoc.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    @Query("SELECT a FROM Appointment a WHERE a.patient.userId = :patientId")
    List<Appointment> findByPatientUserId(@Param("patientId") Integer patientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.doctorId = :doctorId")
    List<Appointment> findByDoctorDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.user.userId = :userId")
    List<Appointment> findByDoctorUserId(@Param("userId") Integer userId);
}
