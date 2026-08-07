package com.connectdoc.appointment.client;

import com.connectdoc.appointment.dto.RemoteUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class UserServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    /** Best-effort lookup; returns null if user-service is unreachable or the user doesn't exist. */
    public RemoteUser getUserById(Integer userId) {
        if (userId == null) return null;
        try {
            return restTemplate.getForObject(userServiceUrl + "/api/users/" + userId, RemoteUser.class);
        } catch (RestClientException e) {
            return null;
        }
    }
}
