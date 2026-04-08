package com.resume.analyzer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String jobName;

    @Column(columnDefinition = "TEXT")
    private String jobDetails;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(length = 50)
    private String salary;

    @ElementCollection
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills;

    private LocalDate postDate;

    @Builder.Default
    @Column(name = "required_experience_years")
    private int requiredExperienceYears = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @PrePersist
    public void prePersist() {
        this.postDate = LocalDate.now();
    }
}
