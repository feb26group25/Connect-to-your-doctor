package com.connectdoc.appointment.dto;

// Mirrors user-service's /api/users/{id} response shape.
public class RemoteUser {
    private Integer userId;
    private String name;
    private String email;
    private String mobileNumber;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
}
