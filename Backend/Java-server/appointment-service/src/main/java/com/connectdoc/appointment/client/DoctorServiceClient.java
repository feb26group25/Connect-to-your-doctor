package com.connectdoc.appointment.client;

import com.connectdoc.appointment.dto.RemoteDoctor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class DoctorServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${doctor.service.url}")
    private String doctorServiceUrl;

    /** Best-effort lookup; returns null if doctor-service is unreachable or the doctor doesn't exist. */
    public RemoteDoctor getDoctorById(Integer doctorId) {
        if (doctorId == null) return null;
        try {
            return restTemplate.getForObject(doctorServiceUrl + "/api/doctors/" + doctorId, RemoteDoctor.class);
        } catch (RestClientException e) {
            return null;
        }
    }

    /**
     * A logged-in doctor's dashboard only knows their userId, not their
     * doctorId, so several endpoints need to resolve "is this id actually
     * a userId?" via this lookup.
     */
    public RemoteDoctor getDoctorByUserId(Integer userId) {
        if (userId == null) return null;
        try {
            return restTemplate.getForObject(doctorServiceUrl + "/api/doctors/by-user/" + userId, RemoteDoctor.class);
        } catch (RestClientException e) {
            return null;
        }
    }
}
