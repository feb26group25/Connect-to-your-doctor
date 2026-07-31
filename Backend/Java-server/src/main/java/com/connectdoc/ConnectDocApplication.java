package com.connectdoc;

import com.connectdoc.model.*;
import com.connectdoc.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class ConnectDocApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConnectDocApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(
            RoleRepository roleRepo,
            UserRepository userRepo,
            HospitalRepository hospitalRepo,
            DoctorRepository doctorRepo
    ) {
        return args -> {
            // Seed Roles
            Role adminRole = roleRepo.findByRoleName("Admin").orElseGet(() -> roleRepo.save(new Role(1, "Admin")));
            Role patientRole = roleRepo.findByRoleName("Patient").orElseGet(() -> roleRepo.save(new Role(2, "Patient")));
            Role doctorRole = roleRepo.findByRoleName("Doctor").orElseGet(() -> roleRepo.save(new Role(3, "Doctor")));

            // Seed Admin User
            if (!userRepo.existsByEmail("admin@connectdoc.com")) {
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@connectdoc.com");
                admin.setPassword("admin123");
                admin.setRole(adminRole);
                userRepo.save(admin);
            }

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

            // Seed Sample Doctors if none exist
            if (doctorRepo.count() == 0) {
                // Doctor 1
                User docUser1 = new User();
                docUser1.setName("Dr. Rajesh Sharma");
                docUser1.setEmail("rajesh.sharma@connectdoc.com");
                docUser1.setPassword("doc123");
                docUser1.setMobileNumber("9876543210");
                docUser1.setRole(doctorRole);
                User savedUser1 = userRepo.save(docUser1);

                Doctor doc1 = new Doctor();
                doc1.setUser(savedUser1);
                doc1.setSpecialization("Cardiologist");
                doc1.setDegree("MD Cardiology");
                doc1.setExperienceYears(12);
                doc1.setConsultationFee(new BigDecimal("800.00"));
                doc1.setHospital(hospital);
                doctorRepo.save(doc1);

                // Doctor 2
                User docUser2 = new User();
                docUser2.setName("Dr. Priya Mehta");
                docUser2.setEmail("priya.mehta@connectdoc.com");
                docUser2.setPassword("doc123");
                docUser2.setMobileNumber("9876543211");
                docUser2.setRole(doctorRole);
                User savedUser2 = userRepo.save(docUser2);

                Doctor doc2 = new Doctor();
                doc2.setUser(savedUser2);
                doc2.setSpecialization("Dermatologist");
                doc2.setDegree("MD Dermatology");
                doc2.setExperienceYears(8);
                doc2.setConsultationFee(new BigDecimal("600.00"));
                doc2.setHospital(hospital);
                doctorRepo.save(doc2);
            }
        };
    }
}
