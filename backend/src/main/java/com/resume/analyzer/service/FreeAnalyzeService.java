package com.resume.analyzer.service;

import com.resume.analyzer.dto.Dtos.AtsIssueDto;
import com.resume.analyzer.dto.Dtos.FreeAnalyzeResponse;
import com.resume.analyzer.util.ResumeParser;
import com.resume.analyzer.util.SkillExtractor;
import com.resume.analyzer.util.SkillExtractor.ATSCheckResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FreeAnalyzeService {

    private final ResumeParser resumeParser;
    private final SkillExtractor skillExtractor;

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

    public FreeAnalyzeResponse analyze(MultipartFile resume, String jobDescription) throws IOException {
        String resumeText = resumeParser.extractText(resume);
        List<String> jdSkills = extractSkillsFromText(jobDescription);
        log.info("Free analyze: {} JD skills, resume length={}", jdSkills.size(), resumeText.length());

        ATSCheckResult ats = skillExtractor.deepAnalyze(resumeText, jdSkills, 0);
        String candidateName = resumeParser.extractName(resumeText);

        List<AtsIssueDto> issueDtos = ats.getIssues().stream()
            .map(i -> new AtsIssueDto(i.getCategory(), i.getSeverity(), i.getMessage()))
            .collect(Collectors.toList());

        // Build legacy suggestions from issues for backward compat
        List<String> suggestions = ats.getIssues().stream()
            .filter(i -> !i.getSeverity().equals("PASS"))
            .map(i -> i.getMessage())
            .collect(Collectors.toList());

        return FreeAnalyzeResponse.builder()
            .totalScore(ats.getTotalScore()).scoreLabel(ats.getScoreLabel())
            .matchedSkills(ats.getMatchedSkills()).missingSkills(ats.getMissingSkills())
            .extractedSkills(ats.getExtractedSkills())
            .suggestions(suggestions).candidateName(candidateName)
            .experienceYears(ats.getExperienceYears()).education(ats.getEducation())
            .skillScore(ats.getSkillScore()).experienceScore(ats.getExperienceScore())
            .educationScore(ats.getEducationScore()).keywordScore(ats.getKeywordScore())
            // Deep ATS
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
