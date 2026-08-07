package com.connectdoc.appointment.controller;

import com.connectdoc.appointment.model.Appointment;
import com.connectdoc.appointment.model.Medicine;
import com.connectdoc.appointment.model.Prescription;
import com.connectdoc.appointment.repository.AppointmentRepository;
import com.connectdoc.appointment.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // CREATE PRESCRIPTION & MEDICINES
    @PostMapping("/prescription")
    public ResponseEntity<?> addPrescription(@RequestBody Map<String, Object> req) {
        try {
            Integer appointmentId = Integer.parseInt(req.get("appointmentid").toString());
            String diagnosis = req.getOrDefault("whatWasDiagnosed", "").toString();
            String followUpDateStr = req.getOrDefault("followupdate", null) != null ? req.get("followupdate").toString() : null;

            Optional<Appointment> aptOpt = appointmentRepository.findById(appointmentId);
            if (aptOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Appointment not found."));
            }

            Appointment apt = aptOpt.get();
            apt.setStatus("Completed");
            appointmentRepository.save(apt);

            Prescription p = new Prescription();
            p.setAppointment(apt);
            p.setWhatWasDiagnosed(diagnosis);
            if (followUpDateStr != null && !followUpDateStr.isBlank()) {
                p.setFollowUpDate(LocalDate.parse(followUpDateStr));
            }

            List<Map<String, String>> medList = (List<Map<String, String>>) req.get("medicines");
            if (medList != null) {
                for (Map<String, String> m : medList) {
                    Medicine med = new Medicine();
                    med.setNameOfMedicine(m.get("nameofmedicine"));
                    med.setDosage(m.get("dosage"));
                    med.setTiming(m.get("timing"));
                    med.setComment(m.get("comment"));
                    p.addMedicine(med);
                }
            }

            Prescription saved = prescriptionRepository.save(p);
            return ResponseEntity.ok(Map.of("message", "Prescription created successfully!", "prescriptionId", saved.getPrescriptionId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // GET PRESCRIPTION BY APPOINTMENT
    @GetMapping("/prescription/appointment/{appointmentId}")
    public ResponseEntity<?> getPrescriptionByAppointment(@PathVariable Integer appointmentId) {
        Optional<Prescription> pOpt = prescriptionRepository.findByAppointmentId(appointmentId);
        if (pOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(pOpt.get());
    }

    // GET PRESCRIPTION HISTORY BY PATIENT
    @GetMapping("/prescription/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable Integer patientId) {
        List<Prescription> list = prescriptionRepository.findByPatientId(patientId);
        return ResponseEntity.ok(list);
    }
}
