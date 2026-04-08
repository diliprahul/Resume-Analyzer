package com.resume.analyzer.service;

import com.resume.analyzer.dto.Dtos.*;
import com.resume.analyzer.entity.*;
import com.resume.analyzer.repository.*;
import com.resume.analyzer.util.ResumeParser;
import com.resume.analyzer.util.SkillExtractor;
import com.resume.analyzer.util.SkillExtractor.ATSCheckResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ResumeParser resumeParser;
    private final SkillExtractor skillExtractor;

    @Value("${app.upload.dir:uploads/resumes}")
    private String uploadDir;

    @Transactional
    public ResumeResponse analyzeAndSubmit(String username, Long jobId, MultipartFile file) throws IOException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        String resumeText = resumeParser.extractText(file);
        log.info("Extracted {} chars from resume for user {}", resumeText.length(), username);

        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);
        String fileName = username + "_" + jobId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        ATSCheckResult ats = skillExtractor.deepAnalyze(resumeText, job.getSkills(), job.getRequiredExperienceYears());
        String candidateName  = resumeParser.extractName(resumeText);
        String candidateEmail = skillExtractor.extractEmail(resumeText);

        // Replace previous submission for this job
        List<ResumeSubmission> existing = submissionRepository
            .findByUserOrderByUploadDateDesc(user).stream()
            .filter(s -> s.getJob().getId().equals(jobId)).collect(Collectors.toList());
        if (!existing.isEmpty()) submissionRepository.deleteAll(existing);

        List<String> suggestions = ats.getIssues().stream()
            .filter(i -> !i.getSeverity().equals("PASS")).map(i -> i.getMessage()).collect(Collectors.toList());

        ResumeSubmission submission = ResumeSubmission.builder()
            .user(user).job(job).resumeName(file.getOriginalFilename()).resumePath(filePath.toString())
            .score(ats.getTotalScore())
            .matchedSkills(ats.getMatchedSkills()).missingSkills(ats.getMissingSkills())
            .extractedSkills(ats.getExtractedSkills()).suggestions(suggestions)
            .candidateName(candidateName)
            .candidateEmail(candidateEmail != null ? candidateEmail : user.getEmail())
            .experienceYears(ats.getExperienceYears())
            .build();

        submission = submissionRepository.save(submission);
        return mapToResponse(submission, ats);
    }

    public List<ResumeResponse> getMySubmissions(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return submissionRepository.findByUserOrderByUploadDateDesc(user)
            .stream().map(s -> mapToResponse(s, null)).collect(Collectors.toList());
    }

    public List<ResumeResponse> getAllSubmissions() {
        return submissionRepository.findAll().stream()
            .sorted(Comparator.comparing(ResumeSubmission::getUploadDate).reversed())
            .map(s -> mapToResponse(s, null)).collect(Collectors.toList());
    }

    public List<ResumeResponse> getSubmissionsForJob(Long jobId) {
        return submissionRepository.findByJobIdOrderByScoreDesc(jobId)
            .stream().map(s -> mapToResponse(s, null)).collect(Collectors.toList());
    }

    private ResumeResponse mapToResponse(ResumeSubmission s, ATSCheckResult ats) {
        double total = s.getScore() != null ? s.getScore() : 0.0;

        List<AtsIssueDto> issueDtos = ats != null ? ats.getIssues().stream()
            .map(i -> new AtsIssueDto(i.getCategory(), i.getSeverity(), i.getMessage()))
            .collect(Collectors.toList()) : Collections.emptyList();

        return ResumeResponse.builder()
            .id(s.getId()).jobId(s.getJob().getId())
            .jobName(s.getJob().getJobName()).companyName(s.getJob().getCompanyName())
            .resumeName(s.getResumeName()).totalScore(total)
            .skillScore(ats != null ? ats.getSkillScore() : null)
            .experienceScore(ats != null ? ats.getExperienceScore() : null)
            .educationScore(ats != null ? ats.getEducationScore() : null)
            .keywordScore(ats != null ? ats.getKeywordScore() : null)
            .matchedSkills(s.getMatchedSkills() != null ? s.getMatchedSkills() : Collections.emptyList())
            .missingSkills(s.getMissingSkills() != null ? s.getMissingSkills() : Collections.emptyList())
            .extractedSkills(s.getExtractedSkills() != null ? s.getExtractedSkills() : Collections.emptyList())
            .suggestions(s.getSuggestions() != null ? s.getSuggestions() : Collections.emptyList())
            .candidateName(s.getCandidateName()).candidateEmail(s.getCandidateEmail())
            .experienceYears(s.getExperienceYears())
            .education(ats != null ? ats.getEducation() : null)
            .uploadDate(s.getUploadDate()).scoreLabel(getLabel(total))
            .atsIssues(issueDtos)
            .buzzwordsFound(ats != null ? ats.getBuzzwordsFound() : Collections.emptyList())
            .fillerWordsFound(ats != null ? ats.getFillerWordsFound() : Collections.emptyList())
            .actionVerbsFound(ats != null ? ats.getActionVerbsFound() : Collections.emptyList())
            .metricsFound(ats != null ? ats.getMetricsFound() : Collections.emptyList())
            .hasEmail(ats != null ? ats.isHasEmail() : null)
            .hasPhone(ats != null ? ats.isHasPhone() : null)
            .hasLinkedIn(ats != null ? ats.isHasLinkedIn() : null)
            .hasGitHub(ats != null ? ats.isHasGitHub() : null)
            .hasStrongActionVerbs(ats != null ? ats.isHasStrongActionVerbs() : null)
            .hasMeasurableImpact(ats != null ? ats.isHasMeasurableImpact() : null)
            .missingSections(ats != null ? ats.getMissingSections() : Collections.emptyList())
            .formatIssues(ats != null ? ats.getFormatIssues() : Collections.emptyList())
            .build();
    }

    private String getLabel(double s) {
        if (s >= 85) return "Excellent";
        if (s >= 70) return "Good";
        if (s >= 50) return "Average";
        if (s >= 30) return "Below Average";
        return "Poor";
    }
}
