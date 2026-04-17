package com.resume.analyzer.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class Dtos {

    // ── Auth ──────────────────────────────────────────────────────────────────
    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank(message = "Username required") @Size(min = 3, max = 50) private String username;
        @NotBlank(message = "Password required") @Size(min = 8, message = "Password must be at least 8 characters") @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Password must contain at least one letter and one number") private String password;
        @NotBlank(message = "Email required") @Email(message = "Valid email required") @Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$", message = "Invalid email format") private String email;
        private String contactNo;
        private String address;
    }

    @Getter @Setter
    public static class LoginRequest {
        @NotBlank(message = "Username or email required") private String usernameOrEmail;
        @NotBlank(message = "Password required") private String password;
    }

    @Getter @Setter @AllArgsConstructor
    public static class AuthResponse {
        private String token, username, email, role;
    }

    // ── Job ───────────────────────────────────────────────────────────────────
    @Getter @Setter
    public static class JobRequest {
        @NotBlank private String jobName;
        private String jobDetails;
        @NotBlank private String companyName;
        private String salary;
        @NotEmpty private List<String> skills;
        private int requiredExperienceYears;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobResponse {
        private Long id;
        private String jobName, jobDetails, companyName, salary;
        private List<String> skills;
        private LocalDate postDate;
        private int requiredExperienceYears;
        private boolean alreadyApplied;
    }

    // ── ATS Issue ─────────────────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AtsIssueDto {
        private String category;   // Contact, Structure, Skills, Experience, Impact, Writing, Format, Overall
        private String severity;   // HIGH, MEDIUM, LOW, PASS
        private String message;
    }

    // ── Resume ────────────────────────────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ResumeResponse {
        private Long id, jobId;
        private String jobName, companyName, resumeName;
        private Double totalScore, skillScore, experienceScore, educationScore, keywordScore;
        private List<String> matchedSkills, missingSkills, extractedSkills, suggestions;
        private String candidateName, candidateEmail, education, scoreLabel;
        private Integer experienceYears;
        private LocalDate uploadDate;
        // Deep ATS fields
        private List<AtsIssueDto> atsIssues;
        private List<String> buzzwordsFound, fillerWordsFound, actionVerbsFound, metricsFound;
        private Boolean hasEmail, hasPhone, hasLinkedIn, hasGitHub;
        private Boolean hasStrongActionVerbs, hasMeasurableImpact;
        private List<String> missingSections, formatIssues;

        public List<String> getMatchedSkills() {
            return matchedSkills != null ? new java.util.ArrayList<>(matchedSkills) : Collections.emptyList();
        }
        public List<String> getMissingSkills() {
            return missingSkills != null ? new java.util.ArrayList<>(missingSkills) : Collections.emptyList();
        }
        public List<String> getExtractedSkills() {
            return extractedSkills != null ? new java.util.ArrayList<>(extractedSkills) : Collections.emptyList();
        }
        public List<String> getSuggestions() {
            return suggestions != null ? new java.util.ArrayList<>(suggestions) : Collections.emptyList();
        }
    }

    // ── Free Analyze ──────────────────────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FreeAnalyzeResponse {
        private Double totalScore, skillScore, experienceScore, educationScore, keywordScore;
        private String scoreLabel, candidateName, education;
        private Integer experienceYears;
        private List<String> matchedSkills, missingSkills, extractedSkills, suggestions;
        // Deep ATS fields
        private List<AtsIssueDto> atsIssues;
        private List<String> buzzwordsFound, fillerWordsFound, actionVerbsFound, metricsFound;
        private Boolean hasEmail, hasPhone, hasLinkedIn, hasGitHub;
        private Boolean hasStrongActionVerbs, hasMeasurableImpact;
        private List<String> missingSections, formatIssues;
    }

    // ── Chat ──────────────────────────────────────────────────────────────────
    @Getter @Setter
    public static class ChatRequest {
        @NotBlank private String message;
        private String context;   // optional resume/job context from ATS result
    }

    @Getter @Setter @AllArgsConstructor
    public static class ChatResponse {
        private String reply;
    }

    // ── Feedback ──────────────────────────────────────────────────────────────
    @Getter @Setter
    public static class FeedbackRequest {
        @NotBlank private String feedbackText;
        @Min(1) @Max(5) private int rating;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FeedbackResponse {
        private Long id;
        private String username, feedbackText;
        private int rating;
        private LocalDate feedbackDate;
    }

    // ── Notification ──────────────────────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationResponse {
        private Long id, jobId;
        private String message, jobName;
        private boolean read;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationCountResponse {
        private long unreadCount;
        private List<NotificationResponse> notifications;
    }

    // ── Admin Stats ───────────────────────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AdminStats {
        private long totalUsers, totalJobs, totalSubmissions, totalFeedbacks;
    }
}
