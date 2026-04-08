package com.resume.analyzer.controller;

import com.resume.analyzer.dto.Dtos.ChatRequest;
import com.resume.analyzer.dto.Dtos.ChatResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Chat assistant using Groq API (free tier: https://console.groq.com)
 * Falls back to rule-based responses if no API key is configured.
 *
 * To enable AI chat:
 * 1. Sign up at https://console.groq.com (free account)
 * 2. Create an API key
 * 3. Set GROQ_API_KEY environment variable OR add to application.properties:
 *    app.groq.api-key=gsk_your_key_here
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:*")
public class ChatController {

    private final RestTemplate restTemplate;

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";  // free, fast

    private static final String SYSTEM_PROMPT =
        "You are a professional Resume & ATS (Applicant Tracking System) expert assistant. " +
        "Your role is to help users improve their resumes to pass ATS filters and impress recruiters. " +
        "You give specific, actionable advice about: resume format, ATS optimization, keyword usage, " +
        "buzzwords to avoid, measurable impact phrases, action verbs, skills to add, and career guidance. " +
        "Be concise, practical, and encouraging. Use markdown formatting with bullet points when helpful. " +
        "When the user shares their ATS analysis context, reference those specific issues in your advice.";

    @PostConstruct
    public void init() {
        log.info("ChatController initialized. Groq API key loaded: {}", groqApiKey != null && !groqApiKey.isBlank());
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req) {
        String message = req.getMessage() == null ? "" : req.getMessage().trim();
        String context = req.getContext() == null ? "" : req.getContext().trim();

        // Build full message with context if available
        String fullMessage = context.isEmpty() ? message
            : "My resume ATS analysis context:\n" + context + "\n\nMy question: " + message;

        String reply;
        boolean keyPresent = groqApiKey != null && !groqApiKey.isBlank();
        log.info("Groq API key present: {}, value length: {}", keyPresent, keyPresent ? groqApiKey.length() : 0);
        if (keyPresent) {
            try {
                reply = callGroqApi(fullMessage);
            } catch (Exception e) {
                log.error("Groq API error: {}", e.getMessage());
                reply = fallbackReply(message.toLowerCase(), false); // key exists but API failed
            }
        } else {
            reply = fallbackReply(message.toLowerCase(), true); // key missing
        }

        return ResponseEntity.ok(new ChatResponse(reply));
    }

    private String callGroqApi(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", MODEL);
        body.put("max_tokens", 800);
        body.put("temperature", 0.7);
        body.put("messages", List.of(
            Map.of("role", "system", "content", SYSTEM_PROMPT),
            Map.of("role", "user", "content", userMessage)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            List<?> choices = (List<?>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<?, ?> choice = (Map<?, ?>) choices.get(0);
                Map<?, ?> msgObj = (Map<?, ?>) choice.get("message");
                if (msgObj != null) return (String) msgObj.get("content");
            }
        }
        throw new RuntimeException("Empty response from Groq");
    }

    // ── Rule-based fallback (used when no API key set or API call failed) ─────
    private String fallbackReply(String lower, boolean keyMissing) {
        if (lower.matches(".*(hello|hi|hey).*"))
            return "👋 Hi! I'm your **Resume ATS Assistant**.\n\nI can help you with:\n" +
                   "• 🎯 ATS optimization tips\n• 📝 Writing strong bullet points\n" +
                   "• 💡 Skills to add for specific roles\n• 🔍 Fixing buzzwords & filler words\n\n" +
                   (keyMissing
                       ? "**Tip:** To unlock AI-powered responses, add a free Groq API key in `application.properties`. " +
                         "Sign up at [console.groq.com](https://console.groq.com) — it is free!"
                       : "AI responses are temporarily unavailable. Showing rule-based help below.");

        if (lower.contains("buzzword"))
            return "**Buzzwords to Remove:**\n\n" +
                   "❌ synergy, leverage, guru, ninja, rockstar, visionary, thought leader, " +
                   "world-class, cutting-edge, passionate, results-driven, detail-oriented\n\n" +
                   "✅ **Replace with specifics:**\n" +
                   "Instead of 'passionate about technology' → 'Built 3 full-stack projects in React + Spring Boot'\n" +
                   "Instead of 'results-driven' → 'Reduced API latency by 35% through query optimization'";

        if (lower.contains("filler") || lower.contains("weak phrase"))
            return "**Filler Phrases to Replace:**\n\n" +
                   "❌ `responsible for` → ✅ `Led` / `Managed` / `Owned`\n" +
                   "❌ `worked on` → ✅ `Developed` / `Built` / `Engineered`\n" +
                   "❌ `assisted with` → ✅ `Contributed to` / `Collaborated on`\n" +
                   "❌ `helped with` → ✅ `Supported` / `Facilitated`\n" +
                   "❌ `was involved in` → ✅ `Participated in` / `Executed`\n\n" +
                   "**Rule:** Start every bullet with a strong past-tense action verb.";

        if (lower.contains("measurable") || lower.contains("impact") || lower.contains("metric") || lower.contains("number"))
            return "**How to Add Measurable Impact:**\n\n" +
                   "Use the formula: **Action Verb + Task + Result (with number)**\n\n" +
                   "Examples:\n" +
                   "• Optimized database queries, **reducing page load time by 40%**\n" +
                   "• Built REST APIs serving **50,000+ daily requests**\n" +
                   "• Led a team of **5 engineers** to deliver the project **2 weeks ahead of schedule**\n" +
                   "• Reduced bug count by **60%** through automated testing with JUnit\n" +
                   "• Migrated legacy system to microservices, **cutting deployment time by 3x**\n\n" +
                   "**Tip:** Even rough numbers are better than none. Estimate if exact figures aren't available.";

        if (lower.contains("format") || lower.contains("ats friendly") || lower.contains("parse"))
            return "**ATS-Friendly Format Rules:**\n\n" +
                   "✅ Use standard section headings: **Experience, Education, Skills, Projects**\n" +
                   "✅ Plain bullet points (- or •), not custom symbols\n" +
                   "✅ Keep bullet points 1-2 lines (10-20 words)\n" +
                   "✅ Fonts: Arial, Calibri, Times New Roman\n" +
                   "✅ Submit as **.docx or PDF** (prefer .docx for ATS)\n\n" +
                   "❌ Avoid: Tables, columns, headers/footers for key info, graphics, text boxes\n" +
                   "❌ Avoid: Fancy fonts, icons, photos\n" +
                   "❌ Avoid: Resume length > 2 pages (for < 10 years experience)";

        if (lower.contains("action verb"))
            return "**Strong Action Verbs for Tech Resumes:**\n\n" +
                   "**Development:** Developed, Built, Engineered, Architected, Designed, Implemented, Coded\n" +
                   "**Optimization:** Optimized, Improved, Reduced, Enhanced, Streamlined, Accelerated\n" +
                   "**Leadership:** Led, Managed, Mentored, Coordinated, Directed, Oversaw\n" +
                   "**Delivery:** Delivered, Launched, Deployed, Shipped, Released, Migrated\n" +
                   "**Analysis:** Analyzed, Evaluated, Assessed, Identified, Diagnosed, Investigated\n\n" +
                   "**Rule:** Every bullet point should start with one of these verbs.";

        if (lower.contains("contact") || lower.contains("linkedin") || lower.contains("github"))
            return "**Contact Section Best Practices:**\n\n" +
                   "Include at the very top:\n" +
                   "• 📧 Professional email (firstname.lastname@gmail.com)\n" +
                   "• 📞 Phone number\n" +
                   "• 🔗 LinkedIn: linkedin.com/in/yourname\n" +
                   "• 💻 GitHub: github.com/yourusername (for developers)\n" +
                   "• 🌍 City, State (full address not needed)\n\n" +
                   "❌ Don't include: Photo, date of birth, marital status, full home address";

        if (lower.contains("score") && (lower.contains("improve") || lower.contains("increase") || lower.contains("boost")))
            return "**How to Boost Your ATS Score:**\n\n" +
                   "1. **Fix HIGH issues first** — Contact info, missing sections, missing skills\n" +
                   "2. **Mirror exact keywords** from the job description (copy exact skill names)\n" +
                   "3. **Add measurable metrics** — At least 3 numbers in your experience bullets\n" +
                   "4. **Remove buzzwords** — Replace vague terms with specific facts\n" +
                   "5. **Use strong action verbs** — Every bullet starts with past-tense verb\n" +
                   "6. **Fix format issues** — No tables, proper section headings\n" +
                   "7. **Quantify skills** — List your tech stack in a dedicated Skills section\n\n" +
                   "💡 **Pro tip:** Tailor your resume for EACH job. A 70%+ match rate significantly improves interview chances.";

        return keyMissing
               ? "I can help you with specific ATS topics! Try asking about:\n\n" +
                 "• 📊 **How to improve your ATS score**\n" +
                 "• ✍️ **Buzzwords to remove**\n" +
                 "• 💪 **Strong action verbs**\n" +
                 "• 📏 **ATS-friendly formatting**\n" +
                 "• 📈 **Adding measurable impact**\n" +
                 "• 📞 **Contact section tips**\n\n" +
                 "**Enable AI responses** by adding a free Groq API key at `console.groq.com` in your `application.properties`."
               : "I can help with ATS topics! Try asking about improving your score, buzzwords, action verbs, formatting, measurable impact, or contact tips.";
    }
}
