package com.connectdoc.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String gender;
    private LocalDate dateOfBirth;
    private String bloodgroup;
    private String city;
    private String state;

    // e.g. "Patient", "Doctor", "Admin" -> resolved against ROLES table
    @NotBlank(message = "Role is required")
    private String roleName;
}
