package com.resume.analyzer.service;

import com.resume.analyzer.dto.Dtos.AtsIssueDto;
import com.resume.analyzer.dto.Dtos.FreeAnalyzeResponse;
import com.resume.analyzer.entity.ResumeSubmission;
import com.resume.analyzer.entity.User;
import com.resume.analyzer.repository.ResumeSubmissionRepository;
import com.resume.analyzer.repository.UserRepository;
import com.resume.analyzer.util.ResumeParser;
import com.resume.analyzer.util.SkillExtractor;
import com.resume.analyzer.util.SkillExtractor.ATSCheckResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FreeAnalyzeService {

    private final ResumeParser resumeParser;
    private final SkillExtractor skillExtractor;
    private final ResumeSubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads/resumes}")
    private String uploadDir;

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
        "java","python","javascript","typescript","react","angular","vue","node.js","nodejs",
        "spring","spring boot","springboot","django","flask","fastapi","express",
        "mysql","postgresql","mongodb","redis","sql","nosql","elasticsearch",
        "aws","azure","gcp","docker","kubernetes","jenkins","git","linux",
        "machine learning","deep learning","tensorflow","pytorch","keras","pandas","numpy",
        "rest api","graphql","microservices","devops","ci/cd","agile","scrum",
        "html","css","bootstrap","tailwind","jquery","next.js","flutter","android","ios",
        "c","c++","c#","php","ruby","go","kotlin","swift","scala","r",
        "hibernate","maven","gradle","jira","kafka","spark","hadoop",
        "data science","data analysis","tableau","power bi","excel",
        "selenium","junit","jest","cypress","postman",
        "object oriented","oop","design patterns","system design","data structures","algorithms"
    );

    public FreeAnalyzeResponse analyze(MultipartFile resume, String jobDescription, String username) throws IOException {
        String resumeText = resumeParser.extractText(resume);
        List<String> jdSkills = extractSkillsFromText(jobDescription);
        log.info("Free analyze: {} JD skills, resume length={}", jdSkills.size(), resumeText.length());

        ATSCheckResult ats = skillExtractor.deepAnalyze(resumeText, jdSkills, 0);
        String candidateName = resumeParser.extractName(resumeText);

        List<AtsIssueDto> issueDtos = ats.getIssues().stream()
            .map(i -> new AtsIssueDto(i.getCategory(), i.getSeverity(), i.getMessage()))
            .collect(Collectors.toList());

        List<String> suggestions = ats.getIssues().stream()
            .filter(i -> !i.getSeverity().equals("PASS"))
            .map(i -> i.getMessage())
            .collect(Collectors.toList());

        // Save to database if user is authenticated
        if (username != null) {
            try {
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    Path uploadPath = Paths.get(uploadDir);
                    Files.createDirectories(uploadPath);
                    String fileName = username + "_free_" + System.currentTimeMillis() + "_" + resume.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.write(filePath, resume.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

                    ResumeSubmission submission = ResumeSubmission.builder()
                        .user(user)
                        .resumeName(resume.getOriginalFilename())
                        .resumePath(filePath.toString())
                        .score(ats.getTotalScore())
                        .candidateName(candidateName)
                        .candidateEmail(user.getEmail())
                        .experienceYears(ats.getExperienceYears())
                        .freeAnalyze(true)
                        .build();
                    submission.setMatchedSkills(new HashSet<>(ats.getMatchedSkills()));
                    submission.setMissingSkills(new HashSet<>(ats.getMissingSkills()));
                    submission.setExtractedSkills(new HashSet<>(ats.getExtractedSkills()));
                    submission.setSuggestions(new HashSet<>(suggestions));
                    submissionRepository.save(submission);
                    log.info("Free analyze saved for user {}", username);
                }
            } catch (Exception e) {
                log.error("Failed to save free analyze result: {}", e.getMessage());
            }
        }

        return FreeAnalyzeResponse.builder()
            .totalScore(ats.getTotalScore()).scoreLabel(ats.getScoreLabel())
            .matchedSkills(ats.getMatchedSkills()).missingSkills(ats.getMissingSkills())
            .extractedSkills(ats.getExtractedSkills())
            .suggestions(suggestions).candidateName(candidateName)
            .experienceYears(ats.getExperienceYears()).education(ats.getEducation())
            .skillScore(ats.getSkillScore()).experienceScore(ats.getExperienceScore())
            .educationScore(ats.getEducationScore()).keywordScore(ats.getKeywordScore())
            .atsIssues(issueDtos)
            .buzzwordsFound(ats.getBuzzwordsFound()).fillerWordsFound(ats.getFillerWordsFound())
            .actionVerbsFound(ats.getActionVerbsFound()).metricsFound(ats.getMetricsFound())
            .hasEmail(ats.isHasEmail()).hasPhone(ats.isHasPhone())
            .hasLinkedIn(ats.isHasLinkedIn()).hasGitHub(ats.isHasGitHub())
            .hasStrongActionVerbs(ats.isHasStrongActionVerbs())
            .hasMeasurableImpact(ats.isHasMeasurableImpact())
            .missingSections(ats.getMissingSections()).formatIssues(ats.getFormatIssues())
            .build();
    }

    private List<String> extractSkillsFromText(String jd) {
        if (jd == null || jd.isBlank()) return Collections.emptyList();
        String lower = jd.toLowerCase();
        return KNOWN_SKILLS.stream().filter(lower::contains).distinct().collect(Collectors.toList());
    }
}
