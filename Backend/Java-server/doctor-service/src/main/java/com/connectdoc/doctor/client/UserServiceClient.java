package com.connectdoc.doctor.client;

import com.connectdoc.doctor.dto.RemoteUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

// Thin wrapper around calls to user-service. Keeping all inter-service
// REST calls in one place makes it obvious where the network boundary is.
@Component
public class UserServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    /**
     * Creates a new User in user-service with role "Doctor" and returns the
     * created user's id/name/email/mobile so doctor-service can store its
     * own denormalized Doctor row.
     */
    public RemoteUser registerDoctorUser(String name, String email, String password, String mobileNumber) {
        Map<String, String> body = new HashMap<>();
        body.put("name", name);
        body.put("email", email);
        body.put("password", password);
        body.put("mobileNumber", mobileNumber);
        body.put("roleName", "Doctor");

        Map response = restTemplate.postForObject(userServiceUrl + "/api/auth/register", body, Map.class);

        RemoteUser user = new RemoteUser();
        if (response != null) {
            user.setUserId((Integer) response.get("userId"));
            user.setName((String) response.get("name"));
            user.setEmail((String) response.get("email"));
            user.setMobileNumber(mobileNumber);
        }
        return user;
    }

    /** Best-effort lookup; returns null if user-service is unreachable or the user doesn't exist. */
    public RemoteUser getUserById(Integer userId) {
        try {
            return restTemplate.getForObject(userServiceUrl + "/api/users/" + userId, RemoteUser.class);
        } catch (RestClientException e) {
            return null;
        }
    }
}
