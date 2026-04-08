package com.resume.analyzer.controller;

import com.resume.analyzer.dto.Dtos.*;
import com.resume.analyzer.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:*")
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> postJob(
            @RequestBody @Valid JobRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.postJob(req));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getJobs(
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(jobService.getAllActiveJobs(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(jobService.getJobById(id, username));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
