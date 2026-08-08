# ConnectDoc — AI Feedback Insights Service (Service 4)

Runs on port **8084**. Owns no database table — it's a pure "intelligence layer" that reads
real feedback from appointment-service and runs it through an LLM to find recurring themes
and sentiment, matching your project description: *"Generative AI is integrated into the
feedback module to analyze patient feedback and generate sentiment-based insights."*

## 1. Get a free Gemini API key

1. Go to https://aistudio.google.com/apikey and sign in with any Google account. **No credit card required** — this is a genuinely free tier, unlike OpenAI.
2. Click "Create API key" and copy it (starts with `AIza...`).
3. **Never hardcode it into `application.properties`** or commit it to GitHub. Set it as an
   environment variable instead:

   **Windows PowerShell (same terminal you'll run the service from):**
   ```
   $env:GEMINI_API_KEY="AIza-your-real-key-here"
   mvn spring-boot:run
   ```
   Setting it in a terminal only lasts for that session — you'll need to set it again each
   time you open a new terminal to run this service, unless you set it as a permanent
   Windows environment variable via System Properties → Environment Variables.

4. **One easy-to-hit trap:** don't add `spring.ai.google.genai.project-id` or
   `spring.ai.google.genai.location` to `application.properties`, even out of curiosity.
   Either one silently switches Spring AI into **paid** Vertex AI mode, and your free API
   key then gets rejected with a confusing 400 error that looks like a quota problem but
   isn't. API key alone = free tier. Keep it that way.

## 2. Run order

This service calls `appointment-service` (port 8083) to get real feedback data, so:
1. `discovery-service` (8761)
2. `user-service`, `doctor-service`, `appointment-service` (8081/8082/8083)
3. `ai-service` (8084) — **only after setting `GEMINI_API_KEY`**

## 3. Test in Postman

```
GET http://localhost:8084/api/ai/feedback-insights/1
```
(Use a real `doctorId` that already has feedback with written comments — check your
`feedback` table, or use one of the doctors you tested the booking flow with earlier.)

Expected response shape:
```json
{
  "doctorId": 1,
  "totalFeedbackAnalyzed": 4,
  "averageRating": 4.3,
  "overallSentiment": "Positive",
  "themes": [
    {
      "name": "Clear explanations",
      "sentiment": "Positive",
      "summary": "Patients consistently mention the doctor explains diagnoses and treatment clearly.",
      "count": 3
    }
  ]
}
```

## 4. What happens with no feedback / no written comments

- No feedback rows at all → returns `totalFeedbackAnalyzed: 0`, empty themes, no API call made
  (saves you API cost on doctors nobody has reviewed yet)
- Feedback exists but every comment is blank (just a star rating) → returns the real average
  rating and a sentiment label computed from the rating itself, but skips the AI call entirely,
  since there's no text for it to analyze

## 5. Frontend

Already wired into `DoctorFeedback.jsx` — a doctor viewing their feedback page now sees a
"Generate AI Insights" button above their raw reviews. Clicking it calls this service and
renders the themes as cards, color-coded by sentiment (green/positive, red/negative,
amber/mixed).

## 6. A note on rate limits and reliability for your demo

Every click of "Generate AI Insights" is a real, live call to Google's Gemini API. The free
tier has no cost, but it does have rate limits (a handful of requests per minute, and a daily
cap) — completely fine for a demo, but don't spam the button dozens of times in quick
succession while testing, or you may briefly hit a `429` rate-limit response. For your
evaluation demo:
- Test it once beforehand to confirm your API key works
- Have a doctor account ready with several feedback entries that have real written comments
  (not just star ratings) — the more varied the comments, the more interesting the themes
- If the API is briefly slow during a live demo, the button will just show "Analyzing…" a
  bit longer — that's normal for an external API call, not a bug
