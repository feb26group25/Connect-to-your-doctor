package com.connectdoc.ai.controller;

import com.connectdoc.ai.model.FeedbackInsightsResponse;
import com.connectdoc.ai.service.FeedbackInsightService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/ai")
public class AiFeedbackController {

    private final FeedbackInsightService feedbackInsightService;

    public AiFeedbackController(FeedbackInsightService feedbackInsightService) {
        this.feedbackInsightService = feedbackInsightService;
    }

    @GetMapping("/feedback-insights/{doctorId}")
    public FeedbackInsightsResponse getInsights(@PathVariable Integer doctorId) {
        return feedbackInsightService.analyze(doctorId);
    }
}