package com.connectdoc.ai.service;

import com.connectdoc.ai.client.AppointmentServiceClient;
import com.connectdoc.ai.dto.RemoteFeedback;
import com.connectdoc.ai.model.AiThemeList;
import com.connectdoc.ai.model.FeedbackInsightsResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackInsightService {

    private final ChatClient chatClient;
    private final AppointmentServiceClient appointmentServiceClient;

    public FeedbackInsightService(ChatClient chatClient, AppointmentServiceClient appointmentServiceClient) {
        this.chatClient = chatClient;
        this.appointmentServiceClient = appointmentServiceClient;
    }

    public FeedbackInsightsResponse analyze(Integer doctorId) {
        // 1. Real data - fetch actual submitted feedback for this doctor from
        //    appointment-service (the service that actually owns it).
        List<RemoteFeedback> feedback = appointmentServiceClient.getFeedbackForDoctor(doctorId);

        if (feedback.isEmpty()) {
            return new FeedbackInsightsResponse(doctorId, 0, null, "No feedback yet", List.of());
        }

        // 2. Plain facts we compute ourselves - never ask the LLM to do
        //    arithmetic it might get subtly wrong.
        double averageRating = feedback.stream()
                .filter(f -> f.getRating() != null)
                .mapToInt(RemoteFeedback::getRating)
                .average()
                .orElse(0.0);
        double roundedAverage = Math.round(averageRating * 10.0) / 10.0;

        // Only feed comments that actually have text - a bare star rating with
        // no comment gives the LLM nothing to analyze.
        List<String> comments = feedback.stream()
                .map(RemoteFeedback::getComments)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toList());

        if (comments.isEmpty()) {
            // Ratings exist but nobody wrote anything - nothing for the LLM to
            // cluster into themes, so skip the API call entirely.
            return new FeedbackInsightsResponse(doctorId, feedback.size(), roundedAverage,
                    averageRating >= 4 ? "Positive" : averageRating >= 2.5 ? "Mixed" : "Negative", List.of());
        }

        String numberedComments = comments.stream()
                .map(c -> "- " + c)
                .collect(Collectors.joining("\n"));

        // 3. This is the actual use case for an LLM here: many independent,
        //    messy comments -> a handful of clustered, named themes with
        //    sentiment. Not something a keyword count or GROUP BY could do
        //    reliably, since comments overlap, use different wording for the
        //    same complaint, and mix multiple topics in one sentence.
        String prompt = """
                You are analyzing patient feedback comments about a doctor, for a
                healthcare platform's admin/doctor dashboard.

                Read all the comments below and identify the 3 to 5 main recurring
                themes. For each theme, provide:
                - name: a short theme label (a few words, e.g. "Long wait times", "Clear explanations")
                - sentiment: Positive, Negative, or Mixed
                - summary: 1-2 sentences synthesizing what patients are saying
                - count: how many of the comments below relate to this theme

                Also provide an overallSentiment across ALL the comments combined:
                Positive, Negative, or Mixed.

                Be constructive and specific - this feedback should help the doctor
                understand what to keep doing well and what to improve. Do not
                include any patient-identifying details, even if present in a comment.

                Comments:
                %s
                """.formatted(numberedComments);

        AiThemeList aiResult = chatClient.prompt()
                .user(prompt)
                .call()
                .entity(AiThemeList.class);

        return new FeedbackInsightsResponse(
                doctorId,
                feedback.size(),
                roundedAverage,
                aiResult.overallSentiment(),
                aiResult.themes()
        );
    }
}
