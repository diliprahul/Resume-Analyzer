package com.resume.analyzer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name = "resume_submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResumeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @Builder.Default
    @Column(nullable = false)
    private boolean freeAnalyze = false;

    @Column(nullable = false)
    private String resumeName;

    @Column(nullable = false)
    private String resumePath;

    private Double score;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resume_matched_skills", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "skill")
    private Set<String> matchedSkills = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resume_missing_skills", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "skill")
    private Set<String> missingSkills = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resume_extracted_skills", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "skill")
    private Set<String> extractedSkills = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resume_suggestions", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "suggestion", length = 500)
    private Set<String> suggestions = new HashSet<>();

    @Column(length = 100)
    private String candidateName;

    @Column(length = 100)
    private String candidateEmail;

    private Integer experienceYears;

    private LocalDate uploadDate;

    @PrePersist
    public void prePersist() {
        this.uploadDate = LocalDate.now();
    }
}
