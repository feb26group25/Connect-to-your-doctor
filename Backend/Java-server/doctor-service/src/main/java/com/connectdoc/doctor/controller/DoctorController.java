package com.connectdoc.doctor.controller;

import com.connectdoc.doctor.client.AppointmentServiceClient;
import com.connectdoc.doctor.client.UserServiceClient;
import com.connectdoc.doctor.dto.RemoteUser;
import com.connectdoc.doctor.model.Availability;
import com.connectdoc.doctor.model.Doctor;
import com.connectdoc.doctor.model.Hospital;
import com.connectdoc.doctor.repository.AvailabilityRepository;
import com.connectdoc.doctor.repository.DoctorRepository;
import com.connectdoc.doctor.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private AppointmentServiceClient appointmentServiceClient;

    // A doctor's own dashboard only knows their userId (from login), not
    // their doctorId, so every doctor-scoped lookup below accepts either
    // and resolves it the same way the original monolith did.
    private Optional<Doctor> resolveDoctor(Integer idOrUserId) {
        Optional<Doctor> doc = doctorRepository.findById(idOrUserId);
        if (doc.isEmpty()) {
            doc = doctorRepository.findByUserId(idOrUserId);
        }
        return doc;
    }

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
        return resolveDoctor(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PROFILE UPDATE - lets a Doctor fill in / edit their professional
    // details (specialization, degree, experience, fee, hospital) beyond
    // what was captured when Admin first registered them.
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Integer id, @RequestBody Map<String, String> req) {
        Optional<Doctor> docOpt = resolveDoctor(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Doctor d = docOpt.get();

        if (req.containsKey("specialization")) d.setSpecialization(req.get("specialization"));
        if (req.containsKey("degree")) d.setDegree(req.get("degree"));
        if (req.containsKey("mobileNumber")) d.setMobileNumber(req.get("mobileNumber"));
        if (req.containsKey("experienceYears") && !req.get("experienceYears").isBlank()) {
            try {
                d.setExperienceYears(Integer.parseInt(req.get("experienceYears")));
            } catch (NumberFormatException ignored) {}
        }
        if (req.containsKey("consultationFee") && !req.get("consultationFee").isBlank()) {
            try {
                d.setConsultationFee(new java.math.BigDecimal(req.get("consultationFee")));
            } catch (NumberFormatException ignored) {}
        }
        if (req.containsKey("hospitalId") && !req.get("hospitalId").isBlank()) {
            try {
                Integer hospitalId = Integer.parseInt(req.get("hospitalId"));
                hospitalRepository.findById(hospitalId).ifPresent(d::setHospital);
            } catch (NumberFormatException ignored) {}
        }

        Doctor saved = doctorRepository.save(d);
        return ResponseEntity.ok(saved);
    }

    // Used internally by appointment-service to resolve a doctor by their userId
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<?> getDoctorByUserId(@PathVariable Integer userId) {
        Optional<Doctor> doctorOpt = doctorRepository.findByUserId(userId);
        return doctorOpt.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<Availability>> getAvailability(@PathVariable Integer id) {
        Optional<Doctor> doctorOpt = resolveDoctor(id);
        Integer targetDoctorId = doctorOpt.map(Doctor::getDoctorId).orElse(id);
        List<Availability> list = availabilityRepository.findByDoctorDoctorId(targetDoctorId);
        return ResponseEntity.ok(list);
    }

    // Computes actual bookable time slots for a date: generates the raw
    // slot grid from Availability, then calls appointment-service to
    // subtract anything already booked that day.
    @GetMapping("/{id}/slots")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable Integer id,
            @RequestParam(required = false) String date
    ) {
        Optional<Doctor> doctorOpt = resolveDoctor(id);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor not found"));
        }
        Doctor doctor = doctorOpt.get();

        LocalDate targetDate;
        try {
            targetDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format. Use YYYY-MM-DD"));
        }

        String dayOfWeekName = targetDate.getDayOfWeek().name();

        List<Availability> availabilities = availabilityRepository.findByDoctorDoctorId(doctor.getDoctorId());

        List<Availability> matchingAvailabilities = availabilities.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsAvailable()))
                .filter(a -> a.getDayOfWeek() == null ||
                             a.getDayOfWeek().equalsIgnoreCase("ALL") ||
                             a.getDayOfWeek().equalsIgnoreCase(dayOfWeekName))
                .toList();

        List<String> allSlots = new ArrayList<>();
        for (Availability a : matchingAvailabilities) {
            LocalTime current = a.getStartTime();
            LocalTime end = a.getEndTime();
            int step = (a.getSlotDurationMinutes() != null && a.getSlotDurationMinutes() > 0) ? a.getSlotDurationMinutes() : 30;

            while (current != null && end != null && (current.plusMinutes(step).isBefore(end) || current.plusMinutes(step).equals(end))) {
                allSlots.add(current.toString());
                current = current.plusMinutes(step);
            }
        }

        Set<String> bookedSlots = new HashSet<>(appointmentServiceClient.getBookedTimes(doctor.getDoctorId(), targetDate.toString()));

        List<String> availableSlots = allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .distinct()
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("doctorId", doctor.getDoctorId());
        response.put("doctorName", doctor.getDoctorName());
        response.put("date", targetDate.toString());
        response.put("dayOfWeek", dayOfWeekName);
        response.put("availableSlots", availableSlots);
        response.put("bookedSlots", bookedSlots);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/availability")
    public ResponseEntity<?> setAvailability(@RequestBody Map<String, Object> req) {
        try {
            Integer doctorId = Integer.parseInt(req.get("doctorid").toString());
            String dayOfWeek = req.get("dayOfWeek").toString();
            String startTimeStr = req.get("startTime").toString();
            String endTimeStr = req.get("endTime").toString();
            int slotMinutes = Integer.parseInt(req.getOrDefault("slotDurationMinutes", "30").toString());

            Optional<Doctor> docOpt = resolveDoctor(doctorId);
            if (docOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Doctor not found"));

            Availability a = new Availability();
            a.setDoctor(docOpt.get());
            a.setDayOfWeek(dayOfWeek.toUpperCase());
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

    // ADMIN REGISTER DOCTOR (moved here from the monolith's AppointmentController).
    // Creates the login-capable User over in user-service first, then stores
    // the doctor-specific profile locally.
    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@RequestBody Map<String, String> req) {
        try {
            String firstname = req.getOrDefault("firstname", "");
            String lastname = req.getOrDefault("lastname", "");
            String fullName = (firstname + " " + lastname).trim();
            String email = req.get("email");
            String password = req.get("password");
            String contactnumber = req.get("contactnumber");
            String specialization = req.get("specialization");
            String qualification = req.get("qualification");
            String hospitalname = req.get("hospitalname");
            int experience = Integer.parseInt(req.getOrDefault("experience", "0"));

            RemoteUser createdUser = userServiceClient.registerDoctorUser(fullName, email, password, contactnumber);
            if (createdUser == null || createdUser.getUserId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("message", "Could not create login for doctor (user-service unavailable or email already in use)."));
            }

            Hospital hospital = hospitalRepository.findByHospitalName(hospitalname)
                    .orElseGet(() -> {
                        Hospital h = new Hospital();
                        h.setHospitalName(hospitalname);
                        return hospitalRepository.save(h);
                    });

            Doctor doc = new Doctor();
            doc.setUserId(createdUser.getUserId());
            doc.setDoctorName(fullName);
            doc.setEmail(email);
            doc.setMobileNumber(contactnumber);
            doc.setSpecialization(specialization);
            doc.setDegree(qualification);
            doc.setExperienceYears(experience);
            doc.setHospital(hospital);
            doctorRepository.save(doc);

            return ResponseEntity.ok(Map.of("message", "Doctor registered successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
