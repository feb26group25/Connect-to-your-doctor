package com.connectdoc.doctor.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

// Used only when computing a doctor's free slots for a given day: we need
// to know which times are already booked, and Appointment data lives in
// appointment-service.
@Component
public class AppointmentServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${appointment.service.url}")
    private String appointmentServiceUrl;

    /** Best-effort; returns an empty list if appointment-service is unreachable. */
    @SuppressWarnings("unchecked")
    public List<String> getBookedTimes(Integer doctorId, String date) {
        try {
            String url = appointmentServiceUrl + "/appointments/doctor/" + doctorId + "/booked-times?date=" + date;
            List<String> result = restTemplate.getForObject(url, List.class);
            return result != null ? result : List.of();
        } catch (RestClientException e) {
            return List.of();
        }
    }
}
