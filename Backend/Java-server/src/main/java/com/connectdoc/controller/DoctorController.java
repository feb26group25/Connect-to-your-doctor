package com.connectdoc.controller;

import com.connectdoc.model.Availability;
import com.connectdoc.model.Doctor;
import com.connectdoc.repository.AvailabilityRepository;
import com.connectdoc.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @GetMapping
    public ResponseEntity<List<Doctor>> getDoctors(@RequestParam(required = false) String specialization) {
        List<Doctor> doctors;
        if (specialization != null && !specialization.isBlank()) {
            doctors = doctorRepository.findBySpecializationIgnoreCase(specialization.trim());
        } else {
            doctors = doctorRepository.findAll();
        }
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Integer id) {
        return doctorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<Availability>> getAvailability(@PathVariable Integer id) {
        List<Availability> list = availabilityRepository.findByDoctorDoctorId(id);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/availability")
    public ResponseEntity<?> setAvailability(@RequestBody Map<String, Object> req) {
        try {
            Integer doctorId = Integer.parseInt(req.get("doctorid").toString());
            String dayOfWeek = req.get("dayOfWeek").toString();
            String startTimeStr = req.get("startTime").toString();
            String endTimeStr = req.get("endTime").toString();
            int slotMinutes = Integer.parseInt(req.getOrDefault("slotDurationMinutes", "30").toString());

            Optional<Doctor> docOpt = doctorRepository.findById(doctorId);
            if (docOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Doctor not found"));

            Availability a = new Availability();
            a.setDoctor(docOpt.get());
            a.setDayOfWeek(dayOfWeek);
            a.setStartTime(LocalTime.parse(startTimeStr));
            a.setEndTime(LocalTime.parse(endTimeStr));
            a.setSlotDurationMinutes(slotMinutes);
            a.setIsAvailable(true);

            availabilityRepository.save(a);
            return ResponseEntity.ok(Map.of("message", "Availability saved successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
