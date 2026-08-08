package com.connectdoc.ai.model;

public record ThemeSummary(
        String name,        // e.g. "Long wait times", "Clear explanations"
        String sentiment,   // Positive, Negative, or Mixed
        String summary,     // 1-2 sentence synthesis of what patients are saying
        int count           // how many of the input comments touched on this theme
) {
}
