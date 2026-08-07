package com.connectdoc.doctor;

import com.connectdoc.doctor.client.UserServiceClient;
import com.connectdoc.doctor.dto.RemoteUser;
import com.connectdoc.doctor.model.Availability;
import com.connectdoc.doctor.model.Doctor;
import com.connectdoc.doctor.model.Hospital;
import com.connectdoc.doctor.repository.AvailabilityRepository;
import com.connectdoc.doctor.repository.DoctorRepository;
import com.connectdoc.doctor.repository.HospitalRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.LocalTime;

@SpringBootApplication
public class DoctorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(
            HospitalRepository hospitalRepo,
            DoctorRepository doctorRepo,
            AvailabilityRepository availabilityRepo,
            UserServiceClient userServiceClient
    ) {
        return args -> {
            // Seed Sample Hospital
            Hospital hospital = hospitalRepo.findByHospitalName("City General Hospital")
                    .orElseGet(() -> {
                        Hospital h = new Hospital();
                        h.setHospitalName("City General Hospital");
                        h.setAddress("123 Health Ave");
                        h.setCity("Mumbai");
                        h.setState("Maharashtra");
                        h.setPincode("400001");
                        h.setContactNumber("022-12345678");
                        return hospitalRepo.save(h);
                    });

            // Seed Sample Doctors if none exist. Each doctor needs a login
            // account, so we create the User over in user-service first.
            if (doctorRepo.count() == 0) {
                try {
                    RemoteUser user1 = userServiceClient.registerDoctorUser(
                            "Dr. Rajesh Sharma", "rajesh.sharma@connectdoc.com", "doc123", "9876543210");
                    if (user1 != null && user1.getUserId() != null) {
                        Doctor doc1 = new Doctor();
                        doc1.setUserId(user1.getUserId());
                        doc1.setDoctorName("Dr. Rajesh Sharma");
                        doc1.setEmail("rajesh.sharma@connectdoc.com");
                        doc1.setMobileNumber("9876543210");
                        doc1.setSpecialization("Cardiologist");
                        doc1.setDegree("MD Cardiology");
                        doc1.setExperienceYears(12);
                        doc1.setConsultationFee(new BigDecimal("800.00"));
                        doc1.setHospital(hospital);
                        doctorRepo.save(doc1);
                    }

                    RemoteUser user2 = userServiceClient.registerDoctorUser(
                            "Dr. Priya Mehta", "priya.mehta@connectdoc.com", "doc123", "9876543211");
                    if (user2 != null && user2.getUserId() != null) {
                        Doctor doc2 = new Doctor();
                        doc2.setUserId(user2.getUserId());
                        doc2.setDoctorName("Dr. Priya Mehta");
                        doc2.setEmail("priya.mehta@connectdoc.com");
                        doc2.setMobileNumber("9876543211");
                        doc2.setSpecialization("Dermatologist");
                        doc2.setDegree("MD Dermatology");
                        doc2.setExperienceYears(8);
                        doc2.setConsultationFee(new BigDecimal("600.00"));
                        doc2.setHospital(hospital);
                        doctorRepo.save(doc2);
                    }
                } catch (Exception e) {
                    // user-service may not be up yet on first boot race - seeding
                    // is best-effort and safe to skip; it will simply retry on
                    // the next restart since doctorRepo.count() will still be 0.
                    System.out.println("Doctor seed skipped: " + e.getMessage());
                }
            }

            // Seed default Mon-Sat 09:00-17:00 availability for any doctor that doesn't have one yet
            if (availabilityRepo.count() == 0) {
                String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};
                for (Doctor doc : doctorRepo.findAll()) {
                    for (String day : days) {
                        Availability avail = new Availability();
                        avail.setDoctor(doc);
                        avail.setDayOfWeek(day);
                        avail.setStartTime(LocalTime.of(9, 0));
                        avail.setEndTime(LocalTime.of(17, 0));
                        avail.setSlotDurationMinutes(30);
                        avail.setIsAvailable(true);
                        availabilityRepo.save(avail);
                    }
                }
            }
        };
    }
}
