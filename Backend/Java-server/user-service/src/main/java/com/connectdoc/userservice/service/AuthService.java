package com.connectdoc.userservice.service;

import com.connectdoc.userservice.dto.AuthResponse;
import com.connectdoc.userservice.dto.LoginRequest;
import com.connectdoc.userservice.dto.RegisterRequest;
import com.connectdoc.userservice.entity.Role;
import com.connectdoc.userservice.entity.User;
import com.connectdoc.userservice.exception.ApiException;
import com.connectdoc.userservice.repository.RoleRepository;
import com.connectdoc.userservice.repository.UserRepository;
import com.connectdoc.userservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new ApiException("Mobile number already registered", HttpStatus.CONFLICT);
        }

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new ApiException("Invalid role: " + request.getRoleName(), HttpStatus.BAD_REQUEST));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .gender(request.getGender() != null ? User.Gender.valueOf(request.getGender()) : null)
                .dateOfBirth(request.getDateOfBirth())
                .bloodgroup(request.getBloodgroup())
                .city(request.getCity())
                .state(request.getState())
                .role(role)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getUserId(), role.getRoleName());

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getUserId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(role.getRoleName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId(), roleName);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(roleName)
                .build();
    }
}
