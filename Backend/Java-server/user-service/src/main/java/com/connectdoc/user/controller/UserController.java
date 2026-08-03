package com.connectdoc.user.controller;

import com.connectdoc.user.dto.UserDTO;
import com.connectdoc.user.model.User;
import com.connectdoc.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ALL USERS (used by the admin dashboard, previously AppointmentController.getAllUsers)
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> result = userRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // GET SINGLE USER - also called internally by doctor-service and
    // appointment-service to resolve names/emails for a given userId.
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        Optional<User> userOpt = userRepository.findById(id);
        return userOpt.map(u -> ResponseEntity.ok(toDto(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // PROFILE UPDATE - lets a Patient or Doctor fill in the extra details
    // (gender, city, state, mobile, name) that registration doesn't collect.
    // Email and password are intentionally left out here - those need their
    // own dedicated, more careful flow, not a generic profile edit.
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody Map<String, String> req) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User u = userOpt.get();

        if (req.containsKey("name") && req.get("name") != null && !req.get("name").isBlank()) {
            u.setName(req.get("name"));
        }
        if (req.containsKey("mobileNumber")) u.setMobileNumber(req.get("mobileNumber"));
        if (req.containsKey("gender")) u.setGender(req.get("gender"));
        if (req.containsKey("city")) u.setCity(req.get("city"));
        if (req.containsKey("state")) u.setState(req.get("state"));

        User saved = userRepository.save(u);
        return ResponseEntity.ok(toDto(saved));
    }

    private UserDTO toDto(User u) {
        return new UserDTO(
                u.getUserId(),
                u.getName(),
                u.getEmail(),
                u.getMobileNumber(),
                u.getGender(),
                u.getCity(),
                u.getState(),
                u.getRole() != null ? u.getRole().getRoleId() : null,
                u.getRole() != null ? u.getRole().getRoleName() : null
        );
    }
}
