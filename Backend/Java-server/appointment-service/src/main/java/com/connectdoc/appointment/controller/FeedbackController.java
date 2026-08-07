package com.connectdoc.appointment.controller;

import com.connectdoc.appointment.client.DoctorServiceClient;
import com.connectdoc.appointment.dto.RemoteDoctor;
import com.connectdoc.appointment.model.Appointment;
import com.connectdoc.appointment.model.Feedback;
import com.connectdoc.appointment.repository.AppointmentRepository;
import com.connectdoc.appointment.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorServiceClient doctorServiceClient;

    // CREATE FEEDBACK
    @PostMapping("/feedback")
    public ResponseEntity<?> addFeedback(@RequestBody Map<String, Object> req) {
        try {
            Integer appointmentId = Integer.parseInt(req.get("appointmentid").toString());
            Integer rating = Integer.parseInt(req.get("rating").toString());
            String comments = req.getOrDefault("comments", "").toString();

            Optional<Appointment> aptOpt = appointmentRepository.findById(appointmentId);
            if (aptOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Appointment not found."));

            Appointment apt = aptOpt.get();

            Feedback f = new Feedback();
            f.setAppointment(apt);
            f.setDoctorId(apt.getDoctorId());
            f.setRating(rating);
            f.setComments(comments);

            feedbackRepository.save(f);
            return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // GET FEEDBACK FOR DOCTOR
    @GetMapping("/feedback/doctor/{doctorId}")
    public ResponseEntity<List<Feedback>> getDoctorFeedback(@PathVariable Integer doctorId) {
        List<Feedback> list = feedbackRepository.findByDoctorId(doctorId);
        if (list.isEmpty()) {
            RemoteDoctor resolved = doctorServiceClient.getDoctorByUserId(doctorId);
            if (resolved != null) {
                list = feedbackRepository.findByDoctorId(resolved.getDoctorId());
            }
        }
        return ResponseEntity.ok(list);
    }
}
