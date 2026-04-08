package com.resume.analyzer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

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
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false)
    private String resumeName;

    @Column(nullable = false)
    private String resumePath;

    private Double score;

    @ElementCollection
    @CollectionTable(name = "resume_matched_skills", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "skill")
    private List<String> matchedSkills;

    @ElementCollection
    @CollectionTable(name = "resume_missing_skills", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "skill")
    private List<String> missingSkills;

    @ElementCollection
    @CollectionTable(name = "resume_extracted_skills", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "skill")
    private List<String> extractedSkills;

    @ElementCollection
    @CollectionTable(name = "resume_suggestions", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "suggestion", length = 500)
    private List<String> suggestions;

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
