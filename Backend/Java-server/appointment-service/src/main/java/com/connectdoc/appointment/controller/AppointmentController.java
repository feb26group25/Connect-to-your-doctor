package com.connectdoc.appointment.controller;

import com.connectdoc.appointment.client.DoctorServiceClient;
import com.connectdoc.appointment.client.UserServiceClient;
import com.connectdoc.appointment.dto.RemoteDoctor;
import com.connectdoc.appointment.dto.RemoteUser;
import com.connectdoc.appointment.model.Appointment;
import com.connectdoc.appointment.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private DoctorServiceClient doctorServiceClient;

    // BOOK APPOINTMENT
    @PostMapping("/appointment")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> req) {
        try {
            Integer patientId = Integer.parseInt(req.get("patientid").toString());
            Integer doctorIdInput = Integer.parseInt(req.get("doctorid").toString());
            String dateStr = req.get("appointmentdate").toString();
            String timeStr = req.get("appointmenttime").toString();
            String reason = req.getOrDefault("reason", "").toString();

            // Validate patient and doctor exist by checking with their owning services.
            // doctor-service's GET /{id} already falls back to resolving userId -> doctorId,
            // so this also transparently handles a doctor's own userId being passed in.
            RemoteUser patient = userServiceClient.getUserById(patientId);
            RemoteDoctor doctor = doctorServiceClient.getDoctorById(doctorIdInput);

            if (patient == null || doctor == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Patient or Doctor not found."));
            }

            LocalDate apptDate = LocalDate.parse(dateStr);
            LocalTime apptTime = LocalTime.parse(timeStr);

            List<Appointment> existing = appointmentRepository.findActiveAppointmentsByDoctorAndDate(
                    doctor.getDoctorId(), apptDate, List.of("Rejected", "Cancelled")
            );
            boolean isAlreadyBooked = existing.stream()
                    .anyMatch(a -> a.getAppointmentTime() != null && a.getAppointmentTime().equals(apptTime));
            if (isAlreadyBooked) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "This slot (" + timeStr + ") is already booked by another patient. Please select a different time slot."));
            }

            Appointment apt = new Appointment();
            apt.setPatientId(patientId);
            apt.setDoctorId(doctor.getDoctorId());
            apt.setAppointmentDate(apptDate);
            apt.setAppointmentTime(apptTime);
            apt.setReason(reason);
            apt.setStatus("Pending");

            appointmentRepository.save(apt);
            return ResponseEntity.ok(Map.of("message", "Appointment booked successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // Internal endpoint: doctor-service calls this while computing free slots,
    // to know which times on a given date are already taken.
    @GetMapping("/appointments/doctor/{doctorId}/booked-times")
    public ResponseEntity<List<String>> getBookedTimes(@PathVariable Integer doctorId, @RequestParam String date) {
        LocalDate targetDate = LocalDate.parse(date);
        List<Appointment> existing = appointmentRepository.findActiveAppointmentsByDoctorAndDate(
                doctorId, targetDate, List.of("Rejected", "Cancelled")
        );
        List<String> times = existing.stream()
                .filter(a -> a.getAppointmentTime() != null)
                .map(a -> a.getAppointmentTime().toString())
                .distinct()
                .toList();
        return ResponseEntity.ok(times);
    }

    // PATIENT APPOINTMENTS
    @GetMapping("/appointments/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientAppointments(@PathVariable Integer patientId) {
        List<Appointment> list = appointmentRepository.findByPatientId(patientId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentid", a.getAppointmentId());

            RemoteDoctor doc = doctorServiceClient.getDoctorById(a.getDoctorId());
            if (doc != null) {
                String[] nameParts = (doc.getDoctorName() != null ? doc.getDoctorName() : "Doctor").split(" ");
                map.put("firstname", nameParts[0]);
                map.put("lastname", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
                map.put("specialization", doc.getSpecialization());
                map.put("hospitalname", doc.getHospital() != null ? doc.getHospital().getHospitalName() : "—");
            } else {
                map.put("firstname", "Doctor");
                map.put("lastname", "");
                map.put("specialization", "—");
                map.put("hospitalname", "—");
            }
            map.put("appointmentdate", a.getAppointmentDate().toString());
            map.put("appointmenttime", a.getAppointmentTime().toString());
            map.put("reason", a.getReason());
            map.put("status", a.getStatus());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // DOCTOR APPOINTMENTS
    @GetMapping("/appointments/doctor/{doctorId}")
    public ResponseEntity<List<Map<String, Object>>> getDoctorAppointments(@PathVariable Integer doctorId) {
        // The doctor dashboard only knows its own userId, so try a direct
        // doctorId match first, then fall back to resolving userId -> doctorId.
        List<Appointment> list = appointmentRepository.findByDoctorId(doctorId);
        if (list.isEmpty()) {
            RemoteDoctor resolved = doctorServiceClient.getDoctorByUserId(doctorId);
            if (resolved != null) {
                list = appointmentRepository.findByDoctorId(resolved.getDoctorId());
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentid", a.getAppointmentId());

            RemoteUser p = userServiceClient.getUserById(a.getPatientId());
            if (p != null) {
                String[] nameParts = (p.getName() != null ? p.getName() : "Patient").split(" ");
                map.put("patientfirst", nameParts[0]);
                map.put("patientlast", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
                map.put("patientemail", p.getEmail());
            }
            map.put("appointmentdate", a.getAppointmentDate().toString());
            map.put("appointmenttime", a.getAppointmentTime().toString());
            map.put("reason", a.getReason());
            map.put("status", a.getStatus());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // UPDATE APPOINTMENT STATUS
    @PutMapping("/appointment/{action}/{appointmentId}")
    public ResponseEntity<?> updateStatus(@PathVariable String action, @PathVariable Integer appointmentId) {
        Optional<Appointment> aptOpt = appointmentRepository.findById(appointmentId);
        if (aptOpt.isEmpty()) return ResponseEntity.notFound().build();

        Appointment apt = aptOpt.get();
        switch (action.toLowerCase()) {
            case "accept": apt.setStatus("Accepted"); break;
            case "reject": apt.setStatus("Rejected"); break;
            case "complete": apt.setStatus("Completed"); break;
            case "cancel": apt.setStatus("Cancelled"); break;
            default: return ResponseEntity.badRequest().body(Map.of("message", "Invalid action"));
        }
        appointmentRepository.save(apt);
        return ResponseEntity.ok(Map.of("message", "Status updated to " + apt.getStatus()));
    }

    // ALL APPOINTMENTS FOR ADMIN
    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        List<Appointment> list = appointmentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentid", a.getAppointmentId());

            RemoteUser p = userServiceClient.getUserById(a.getPatientId());
            if (p != null) {
                String[] pParts = (p.getName() != null ? p.getName() : "Patient").split(" ");
                map.put("patientfirst", pParts[0]);
                map.put("patientlast", pParts.length > 1 ? pParts[pParts.length - 1] : "");
            }

            RemoteDoctor d = doctorServiceClient.getDoctorById(a.getDoctorId());
            if (d != null) {
                String[] dParts = (d.getDoctorName() != null ? d.getDoctorName() : "Doctor").split(" ");
                map.put("doctorfirst", dParts[0]);
                map.put("doctorlast", dParts.length > 1 ? dParts[dParts.length - 1] : "");
                map.put("hospitalname", d.getHospital() != null ? d.getHospital().getHospitalName() : "—");
            }

            map.put("appointmentdate", a.getAppointmentDate().toString());
            map.put("appointmenttime", a.getAppointmentTime().toString());
            map.put("reason", a.getReason());
            map.put("status", a.getStatus());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
