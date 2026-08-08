package com.connectdoc.ai.model;

import java.util.List;

/**
 * What we ask the LLM to produce via Spring AI's structured output
 * (.entity(AiThemeList.class)). Everything else in the final response
 * (total count, average rating) is computed in plain code from real data,
 * not asked of the model.
 */
public record AiThemeList(
        List<ThemeSummary> themes,
        String overallSentiment   // Positive, Negative, or Mixed - across ALL feedback
) {
}
