package com.connectdoc.ai.client;

import com.connectdoc.ai.dto.RemoteFeedback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

/**
 * Same "call the owning service over real HTTP, don't reach into its
 * database" pattern used everywhere else in this project (e.g.
 * appointment-service calling doctor-service). ai-service does NOT own the
 * feedback table and never will.
 */
@Component
public class AppointmentServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.appointment-service.base-url}")
    private String appointmentServiceBaseUrl;

    public AppointmentServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<RemoteFeedback> getFeedbackForDoctor(Integer doctorId) {
        String url = appointmentServiceBaseUrl + "/feedback/doctor/" + doctorId;
        RemoteFeedback[] result = restTemplate.getForObject(url, RemoteFeedback[].class);
        return result == null ? List.of() : Arrays.asList(result);
    }
}
