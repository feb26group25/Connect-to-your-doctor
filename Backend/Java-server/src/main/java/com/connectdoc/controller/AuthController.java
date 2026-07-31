package com.connectdoc.controller;

import com.connectdoc.model.Role;
import com.connectdoc.model.User;
import com.connectdoc.repository.RoleRepository;
import com.connectdoc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            email = request.get("username");
        }
        String password = request.get("password");

        if (email == null || password == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Email/username and password are required.");
            return ResponseEntity.badRequest().body(err);
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        User user = userOpt.get();
        if (!password.equals(user.getPassword())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", user.getUserId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole() != null ? user.getRole().getRoleName() : "Patient");
        resp.put("token", "jwt-token-sample-" + user.getUserId());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String mobileNumber = request.get("mobileNumber");
        String password = request.get("password");
        String roleName = request.getOrDefault("roleName", "Patient");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Email and password are required.");
            return ResponseEntity.badRequest().body(err);
        }

        if (userRepository.existsByEmail(email.trim())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Email is already registered.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(null, roleName)));

        User user = new User();
        user.setName(name);
        user.setEmail(email.trim());
        user.setMobileNumber(mobileNumber);
        user.setPassword(password);
        user.setRole(role);

        User saved = userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", saved.getUserId());
        resp.put("name", saved.getName());
        resp.put("email", saved.getEmail());
        resp.put("role", role.getRoleName());
        resp.put("token", "jwt-token-sample-" + saved.getUserId());

        return ResponseEntity.ok(resp);
    }
}
