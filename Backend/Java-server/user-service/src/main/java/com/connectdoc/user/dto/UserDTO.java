package com.connectdoc.user.dto;

// Flat representation of a User, used both as the API response shape
// and as the payload other services (doctor-service, appointment-service)
// deserialize when they call this service over REST.
public class UserDTO {

    private Integer userId;
    private String name;
    private String email;
    private String mobileNumber;
    private String gender;
    private String city;
    private String state;
    private Integer roleId;
    private String roleName;

    public UserDTO() {}

    public UserDTO(Integer userId, String name, String email, String mobileNumber,
                    String gender, String city, String state, Integer roleId, String roleName) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.gender = gender;
        this.city = city;
        this.state = state;
        this.roleId = roleId;
        this.roleName = roleName;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
