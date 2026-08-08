package com.connectdoc.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Mirrors appointment-service's GET /feedback/doctor/{id} response, but only
 * picks out what this service actually needs. That response also includes
 * feedbackId, a full nested Appointment object, doctorId, and createdAt -
 * @JsonIgnoreProperties lets us safely ignore all of that instead of having
 * to model it exactly.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RemoteFeedback {

    private Integer rating;
    private String comments;

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
