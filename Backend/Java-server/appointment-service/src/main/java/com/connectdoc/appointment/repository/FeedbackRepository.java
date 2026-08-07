package com.connectdoc.appointment.repository;

import com.connectdoc.appointment.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findByDoctorId(Integer doctorId);

    @Query("SELECT f FROM Feedback f WHERE f.appointment.appointmentId = :appointmentId")
    Optional<Feedback> findByAppointmentId(@Param("appointmentId") Integer appointmentId);
}
