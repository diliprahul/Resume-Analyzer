package com.resume.analyzer.controller;

import com.resume.analyzer.dto.Dtos.*;
import com.resume.analyzer.service.ResumeService;
import com.resume.analyzer.service.FreeAnalyzeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:*")
public class ResumeController {

    private final ResumeService resumeService;
    private final FreeAnalyzeService freeAnalyzeService;

    @PostMapping("/analyze")
    public ResponseEntity<ResumeResponse> analyzeResume(
            @RequestParam("jobId") Long jobId,
            @RequestParam("resume") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        return ResponseEntity.ok(resumeService.analyzeAndSubmit(userDetails.getUsername(), jobId, file));
    }

    @PostMapping("/free-analyze")
    public ResponseEntity<FreeAnalyzeResponse> freeAnalyze(
            @RequestParam("resume") MultipartFile file,
            @RequestParam(value = "jobDescription", defaultValue = "") String jobDescription,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        return ResponseEntity.ok(freeAnalyzeService.analyze(file, jobDescription, userDetails != null ? userDetails.getUsername() : null));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> getMySubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeService.getMySubmissions(userDetails.getUsername()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleIOError(IOException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
