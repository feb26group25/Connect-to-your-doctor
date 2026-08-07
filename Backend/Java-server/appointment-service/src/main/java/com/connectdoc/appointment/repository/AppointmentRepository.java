package com.connectdoc.appointment.repository;

import com.connectdoc.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByPatientId(Integer patientId);
    List<Appointment> findByDoctorId(Integer doctorId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentDate = :date AND a.status NOT IN :excludedStatuses"
    )
    List<Appointment> findActiveAppointmentsByDoctorAndDate(
            @org.springframework.data.repository.query.Param("doctorId") Integer doctorId,
            @org.springframework.data.repository.query.Param("date") java.time.LocalDate date,
            @org.springframework.data.repository.query.Param("excludedStatuses") List<String> excludedStatuses
    );
}
