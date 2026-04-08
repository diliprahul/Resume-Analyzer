package com.resume.analyzer.controller;

import com.resume.analyzer.dto.Dtos.*;
import com.resume.analyzer.entity.User;
import com.resume.analyzer.repository.*;
import com.resume.analyzer.service.JobService;
import com.resume.analyzer.service.ResumeService;
import com.resume.analyzer.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final JobService jobService;
    private final ResumeService resumeService;
    private final FeedbackService feedbackService;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ResumeSubmissionRepository submissionRepository;
    private final FeedbackRepository feedbackRepository;

    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> postJob(@Valid @RequestBody JobRequest req) {
        return ResponseEntity.ok(jobService.postJob(req));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @GetMapping("/resumes")
    public ResponseEntity<List<ResumeResponse>> getAllResumes() {
        return ResponseEntity.ok(resumeService.getAllSubmissions());
    }

    @GetMapping("/resumes/job/{jobId}")
    public ResponseEntity<List<ResumeResponse>> getResumesByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(resumeService.getSubmissionsForJob(jobId));
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {
        return ResponseEntity.ok(AdminStats.builder()
            .totalUsers(userRepository.countByRole(User.Role.USER))
            .totalJobs(jobRepository.count())
            .totalSubmissions(submissionRepository.count())
            .totalFeedbacks(feedbackRepository.count())
            .build());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
