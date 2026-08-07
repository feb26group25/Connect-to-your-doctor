package com.connectdoc.user;

import com.connectdoc.user.model.Role;
import com.connectdoc.user.model.User;
import com.connectdoc.user.repository.RoleRepository;
import com.connectdoc.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    // Used by AuthController to hash passwords on register and verify them on login.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner seedDatabase(RoleRepository roleRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Roles
            roleRepo.findByRoleName("Admin").orElseGet(() -> roleRepo.save(new Role(1, "Admin")));
            roleRepo.findByRoleName("Patient").orElseGet(() -> roleRepo.save(new Role(2, "Patient")));
            roleRepo.findByRoleName("Doctor").orElseGet(() -> roleRepo.save(new Role(3, "Doctor")));

            // Seed Admin User (password hashed, never stored in plain text)
            if (!userRepo.existsByEmail("admin@connectdoc.com")) {
                Role adminRole = roleRepo.findByRoleName("Admin").get();
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@connectdoc.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(adminRole);
                userRepo.save(admin);
            }
        };
    }
}
