package com.connectdoc.ai.model;

import java.util.List;

public record FeedbackInsightsResponse(
        Integer doctorId,
        int totalFeedbackAnalyzed,
        Double averageRating,       // computed from real data, not the LLM
        String overallSentiment,
        List<ThemeSummary> themes
) {
}
