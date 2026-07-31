package com.connectdoc.controller;

import com.connectdoc.model.*;
import com.connectdoc.repository.*;
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
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

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
            f.setDoctor(apt.getDoctor());
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
        List<Feedback> list = feedbackRepository.findByDoctorDoctorId(doctorId);
        return ResponseEntity.ok(list);
    }

    // BOOK APPOINTMENT
    @PostMapping("/appointment")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> req) {
        try {
            Integer patientId = Integer.parseInt(req.get("patientid").toString());
            Integer doctorId = Integer.parseInt(req.get("doctorid").toString());
            String dateStr = req.get("appointmentdate").toString();
            String timeStr = req.get("appointmenttime").toString();
            String reason = req.getOrDefault("reason", "").toString();

            Optional<User> patientOpt = userRepository.findById(patientId);
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);

            if (patientOpt.isEmpty() || doctorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Patient or Doctor not found."));
            }

            Appointment apt = new Appointment();
            apt.setPatient(patientOpt.get());
            apt.setDoctor(doctorOpt.get());
            apt.setAppointmentDate(LocalDate.parse(dateStr));
            apt.setAppointmentTime(LocalTime.parse(timeStr));
            apt.setReason(reason);
            apt.setStatus("Pending");

            appointmentRepository.save(apt);
            return ResponseEntity.ok(Map.of("message", "Appointment booked successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // PATIENT APPOINTMENTS
    @GetMapping("/appointments/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientAppointments(@PathVariable Integer patientId) {
        List<Appointment> list = appointmentRepository.findByPatientUserId(patientId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentid", a.getAppointmentId());
            Doctor doc = a.getDoctor();
            if (doc != null && doc.getUser() != null) {
                String[] nameParts = doc.getUser().getName().split(" ");
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
        // Find appointments either by doctorId or userId
        List<Appointment> list = appointmentRepository.findByDoctorDoctorId(doctorId);
        if (list.isEmpty()) {
            list = appointmentRepository.findByDoctorUserId(doctorId);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentid", a.getAppointmentId());
            User p = a.getPatient();
            if (p != null) {
                String[] nameParts = p.getName().split(" ");
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

    // ALL USERS FOR ADMIN
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("userid", u.getUserId());
            String[] nameParts = (u.getName() != null ? u.getName() : "User").split(" ");
            map.put("firstname", nameParts[0]);
            map.put("lastname", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
            map.put("username", u.getEmail());
            map.put("email", u.getEmail());
            map.put("contactnumber", u.getMobileNumber());
            map.put("roleid", u.getRole() != null ? u.getRole().getRoleId() : 2);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // ALL APPOINTMENTS FOR ADMIN
    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        List<Appointment> list = appointmentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("appointmentid", a.getAppointmentId());

            User p = a.getPatient();
            if (p != null) {
                String[] pParts = p.getName().split(" ");
                map.put("patientfirst", pParts[0]);
                map.put("patientlast", pParts.length > 1 ? pParts[pParts.length - 1] : "");
            }

            Doctor d = a.getDoctor();
            if (d != null && d.getUser() != null) {
                String[] dParts = d.getUser().getName().split(" ");
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

    // ADMIN REGISTER DOCTOR
    @PostMapping("/doctor/register")
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

            Role docRole = roleRepository.findByRoleName("Doctor")
                    .orElseGet(() -> roleRepository.save(new Role(3, "Doctor")));

            User user = new User();
            user.setName(fullName);
            user.setEmail(email);
            user.setPassword(password);
            user.setMobileNumber(contactnumber);
            user.setRole(docRole);
            User savedUser = userRepository.save(user);

            Hospital hospital = hospitalRepository.findByHospitalName(hospitalname)
                    .orElseGet(() -> {
                        Hospital h = new Hospital();
                        h.setHospitalName(hospitalname);
                        return hospitalRepository.save(h);
                    });

            Doctor doc = new Doctor();
            doc.setUser(savedUser);
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
