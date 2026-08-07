package com.connectdoc.user.controller;

import com.connectdoc.user.model.Role;
import com.connectdoc.user.model.User;
import com.connectdoc.user.repository.RoleRepository;
import com.connectdoc.user.repository.UserRepository;
import com.connectdoc.user.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

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
        if (!passwordEncoder.matches(password, user.getPassword())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "Patient";
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), roleName);

        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", user.getUserId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", roleName);
        resp.put("token", token);

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

        Role role = roleRepository.findByRoleNameIgnoreCase(roleName.trim())
                .or(() -> roleRepository.findByRoleName(roleName.trim()))
                .orElseGet(() -> roleRepository.save(new Role(null, roleName.trim())));

        User user = new User();
        user.setName(name);
        user.setEmail(email.trim());
        user.setMobileNumber(mobileNumber);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getUserId(), saved.getEmail(), role.getRoleName());

        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", saved.getUserId());
        resp.put("name", saved.getName());
        resp.put("email", saved.getEmail());
        resp.put("role", role.getRoleName());
        resp.put("token", token);

        return ResponseEntity.ok(resp);
    }
}
