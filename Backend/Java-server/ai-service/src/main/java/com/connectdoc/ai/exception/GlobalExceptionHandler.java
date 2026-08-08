package com.connectdoc.ai.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Fires when appointment-service can't be reached to fetch real feedback
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, Object>> handleDownstream(RestClientException ex) {
        return build("Could not reach appointment-service to fetch feedback. Is it running on port 8083?",
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    // Catches Gemini API failures (missing/invalid key, or the Vertex-mode
    // trap where an accidental project-id/location property makes a valid
    // free API key get rejected) with a message that tells a student what to
    // actually check, instead of a raw stack trace.
    //
    // Spring AI wraps the real Google GenAI error (e.g. com.google.genai.
    // errors.ClientException) inside a generic RuntimeException whose own
    // message is just "Failed to generate content". So we walk the cause
    // chain to find the actual underlying message instead of only looking
    // at the outermost one.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        String msg = deepestMessage(ex);
        String lower = msg.toLowerCase();
        if (lower.contains("api key") || lower.contains("401") || lower.contains("unauthorized")
                || lower.contains("400") || lower.contains("permission")) {
            return build("AI request failed (" + msg + ") - check that GEMINI_API_KEY is set correctly as an "
                    + "environment variable before starting ai-service, and that application.properties has NO "
                    + "project-id or location property set (those force paid Vertex AI mode and break a free API key).",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (lower.contains("quota") || lower.contains("429") || lower.contains("rate")) {
            return build("AI request failed (" + msg + ") - the free Gemini API tier has a request-per-minute limit. "
                    + "Wait a bit and try again.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (lower.contains("safety") || lower.contains("blocked") || lower.contains("recitation")) {
            return build("AI request failed (" + msg + ") - Gemini's safety filters blocked this response.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return build("AI analysis failed: " + msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Walks ex -> getCause() -> getCause() ... and returns the message of
    // the innermost exception that actually has one, since that's almost
    // always where the real explanation lives.
    private String deepestMessage(Throwable ex) {
        Throwable current = ex;
        String result = ex.getMessage();
        while (current.getCause() != null) {
            current = current.getCause();
            if (current.getMessage() != null && !current.getMessage().isBlank()) {
                result = current.getMessage();
            }
        }
        return result != null ? result : "";
    }

    private ResponseEntity<Map<String, Object>> build(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}