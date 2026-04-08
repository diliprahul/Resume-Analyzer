package com.resume.analyzer.util;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

/**
 * Comprehensive ATS Resume Checker:
 * Checks skills, experience, education, line length, format issues,
 * buzzwords, filler words, measurable impact, action verbs, contact info,
 * section presence, and more.
 */
@Component
public class SkillExtractor {

    // ── Skills Database ──────────────────────────────────────────────────────
    private static final Set<String> SKILLS_DB = new LinkedHashSet<>(Arrays.asList(
        "java","python","javascript","typescript","c","c++","c#","ruby","go","golang",
        "kotlin","swift","scala","r","php","perl","rust","dart","cobol","fortran",
        "html","css","react","reactjs","react.js","angular","angularjs","vue","vuejs",
        "bootstrap","tailwind","sass","less","jquery","next.js","nextjs","nuxt",
        "redux","webpack","vite","babel",
        "spring","spring boot","springboot","spring mvc","spring security","spring data",
        "django","flask","fastapi","node.js","nodejs","express","expressjs",
        "asp.net","laravel","rails","ruby on rails","struts","hibernate",
        "mysql","postgresql","postgres","oracle","sql server","mongodb","redis",
        "cassandra","elasticsearch","dynamodb","firebase","sqlite","mariadb",
        "neo4j","couchdb","influxdb",
        "aws","amazon web services","azure","gcp","google cloud","docker","kubernetes",
        "jenkins","gitlab ci","github actions","terraform","ansible","chef","puppet",
        "linux","unix","bash","shell scripting","nginx","apache",
        "machine learning","deep learning","nlp","natural language processing",
        "tensorflow","pytorch","keras","scikit-learn","pandas","numpy","matplotlib",
        "opencv","computer vision","data science","data analysis","data visualization",
        "tableau","power bi","hadoop","spark","kafka","airflow","mlops",
        "android","ios","react native","flutter","xamarin","ionic","cordova",
        "junit","selenium","cucumber","testng","jest","mocha","cypress",
        "postman","jmeter","sonarqube",
        "git","github","gitlab","bitbucket","jira","confluence","agile","scrum",
        "kanban","ci/cd","devops","microservices","rest api","restful","graphql",
        "soap","grpc","maven","gradle","npm","yarn",
        "data structures","algorithms","object oriented programming","oop",
        "design patterns","solid principles","system design","sql","nosql",
        "multithreading","concurrency","networking","security",
        "excel","word","powerpoint","photoshop","figma",
        "sap","salesforce","blockchain","iot","embedded systems"
    ));

    // ── Buzzwords to flag ────────────────────────────────────────────────────
    private static final List<String> BUZZWORDS = Arrays.asList(
        "synergy","synergize","leverage","leveraging","paradigm","ecosystem",
        "bandwidth","thought leader","thought leadership","disruptive","innovative",
        "guru","ninja","wizard","rockstar","champion","visionary","evangelist",
        "world-class","best-in-class","cutting-edge","next-generation","game-changer",
        "holistic","proactive","results-driven","detail-oriented","self-starter",
        "go-getter","team player","hard worker","fast learner","passionate","motivated",
        "enthusiastic","dynamic","versatile","seasoned","accomplished"
    );

    // ── Filler / weak words ──────────────────────────────────────────────────
    private static final List<String> FILLER_WORDS = Arrays.asList(
        "responsible for","in charge of","duties included","helped with","assisted with",
        "worked on","was involved in","participated in","contributed to",
        "handled","dealt with","did","made","utilized","utilized the","basically",
        "essentially","various","several","many","etc","and so on","to name a few"
    );

    // ── Strong action verbs ──────────────────────────────────────────────────
    private static final List<String> ACTION_VERBS = Arrays.asList(
        "developed","built","designed","implemented","led","managed","created",
        "optimized","improved","reduced","increased","delivered","launched","deployed",
        "engineered","architected","integrated","automated","streamlined","enhanced",
        "migrated","refactored","established","spearheaded","coordinated","mentored",
        "analyzed","resolved","scaled","achieved","maintained","published"
    );

    // ── Measurable impact patterns ───────────────────────────────────────────
    private static final Pattern METRIC_PATTERN = Pattern.compile(
        "(\\d+\\s*%|\\$\\s*\\d+|\\d+[xX]|\\d+\\+?\\s*(users?|clients?|customers?|" +
        "requests?|transactions?|records?|bugs?|issues?|hours?|days?|weeks?|months?|" +
        "team members?|engineers?|projects?|deployments?|features?|endpoints?|services?))",
        Pattern.CASE_INSENSITIVE
    );

    // ── Patterns ─────────────────────────────────────────────────────────────
    private static final Pattern EXP_PATTERN = Pattern.compile(
        "(\\d+)\\s*[+]?\\s*(?:years?|yrs?|yr)\\s*(?:of\\s+)?(?:experience|exp)?",
        Pattern.CASE_INSENSITIVE
    );
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
    );
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "[+]?[0-9]{10,13}"
    );
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile(
        "linkedin\\.com/in/[a-zA-Z0-9\\-]+", Pattern.CASE_INSENSITIVE
    );
    private static final Pattern GITHUB_PATTERN = Pattern.compile(
        "github\\.com/[a-zA-Z0-9\\-]+", Pattern.CASE_INSENSITIVE
    );

    // ── Required sections ────────────────────────────────────────────────────
    private static final List<String> REQUIRED_SECTIONS = Arrays.asList(
        "education","experience","skills","projects"
    );

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    public List<String> extractSkills(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) return Collections.emptyList();
        String lower = resumeText.toLowerCase();
        List<String> found = new ArrayList<>();
        for (String skill : SKILLS_DB) {
            String pat = skill.length() <= 3
                    ? "\\b" + Pattern.quote(skill) + "\\b"
                    : Pattern.quote(skill);
            if (Pattern.compile(pat, Pattern.CASE_INSENSITIVE).matcher(lower).find()) {
                found.add(skill);
            }
        }
        return found.stream().distinct().collect(Collectors.toList());
    }

    public int extractExperienceYears(String text) {
        if (text == null || text.isBlank()) return 0;
        Matcher m = EXP_PATTERN.matcher(text);
        int max = 0;
        while (m.find()) {
            try { int y = Integer.parseInt(m.group(1)); if (y <= 50) max = Math.max(max, y); }
            catch (NumberFormatException ignored) {}
        }
        return max;
    }

    public String extractEducation(String text) {
        if (text == null || text.isBlank()) return "Not detected";
        String lower = text.toLowerCase();
        if (lower.contains("phd") || lower.contains("ph.d") || lower.contains("doctorate")) return "PhD";
        if (lower.contains("mba")) return "MBA";
        if (lower.contains("m.tech") || lower.contains("mtech") || lower.contains("master")) return "Masters";
        if (lower.contains("mca")) return "MCA";
        if (lower.contains("b.tech") || lower.contains("btech") || lower.contains("bachelor")) return "B.Tech/Bachelor";
        if (lower.contains("b.sc") || lower.contains("bsc")) return "B.Sc";
        if (lower.contains("b.e") || lower.contains("be ")) return "B.E";
        if (lower.contains("diploma")) return "Diploma";
        return "Not detected";
    }

    public String extractEmail(String text) {
        if (text == null) return null;
        Matcher m = EMAIL_PATTERN.matcher(text);
        return m.find() ? m.group() : null;
    }

    public String extractPhone(String text) {
        if (text == null) return null;
        Matcher m = PHONE_PATTERN.matcher(text.replaceAll("[\\s\\-()]", ""));
        return m.find() ? m.group() : null;
    }

    // =========================================================================
    // DEEP ATS ANALYSIS
    // =========================================================================

    /**
     * Full ATS analysis — returns rich ATSCheckResult.
     */
    public ATSCheckResult deepAnalyze(String resumeText, List<String> requiredSkills, int requiredExp) {
        if (resumeText == null) resumeText = "";

        String[] lines = resumeText.split("\\n");

        // ── Skills ──
        List<String> extracted   = extractSkills(resumeText);
        int expYears             = extractExperienceYears(resumeText);
        String education         = extractEducation(resumeText);

        List<String> normReq  = requiredSkills.stream().map(s -> s.toLowerCase().trim()).collect(Collectors.toList());
        List<String> normExt  = extracted.stream().map(s -> s.toLowerCase().trim()).collect(Collectors.toList());
        List<String> matched  = normExt.stream().filter(normReq::contains).collect(Collectors.toList());
        List<String> missing  = normReq.stream().filter(s -> !normExt.contains(s)).collect(Collectors.toList());

        // ── Line length check (word count AND character width) ──
        List<String> longLines   = new ArrayList<>();
        List<String> wideLines   = new ArrayList<>();
        List<String> shortLines  = new ArrayList<>();
        int bulletLineCount = 0;
        for (String line : lines) {
            String t = line.trim();
            if (t.isEmpty()) continue;
            if (t.startsWith("-") || t.startsWith("•") || t.startsWith("*") || t.matches("^[·▪◦➢➤►▶].*")) {
                bulletLineCount++;
                int wordCount = t.split("\\s+").length;
                if (wordCount > 25) longLines.add(t.substring(0, Math.min(60, t.length())) + "…");
                if (wordCount < 5 && t.length() > 3) shortLines.add(t.substring(0, Math.min(60, t.length())) + "…");
                // Character width check — standard resume width is 60-80 chars per line
                if (t.length() > 90) wideLines.add(t.substring(0, Math.min(60, t.length())) + "…");
            }
        }

        // ── Buzzwords ──
        List<String> foundBuzzwords = new ArrayList<>();
        String lower = resumeText.toLowerCase();
        for (String bw : BUZZWORDS) {
            if (lower.contains(bw.toLowerCase())) foundBuzzwords.add(bw);
        }

        // ── Filler words ──
        List<String> foundFillers = new ArrayList<>();
        for (String fw : FILLER_WORDS) {
            if (lower.contains(fw.toLowerCase())) foundFillers.add(fw);
        }

        // ── Action verbs ──
        List<String> foundActionVerbs = new ArrayList<>();
        for (String av : ACTION_VERBS) {
            if (lower.contains(av.toLowerCase())) foundActionVerbs.add(av);
        }
        boolean hasStrongVerbs = foundActionVerbs.size() >= 5;

        // ── Measurable impact ──
        Matcher metricMatcher = METRIC_PATTERN.matcher(resumeText);
        List<String> metrics = new ArrayList<>();
        while (metricMatcher.find()) metrics.add(metricMatcher.group());
        boolean hasMeasurableImpact = metrics.size() >= 2;

        // ── Contact info ──
        boolean hasEmail    = EMAIL_PATTERN.matcher(resumeText).find();
        boolean hasPhone    = PHONE_PATTERN.matcher(resumeText.replaceAll("[\\s\\-()]","")).find();
        boolean hasLinkedIn = LINKEDIN_PATTERN.matcher(resumeText).find();
        boolean hasGitHub   = GITHUB_PATTERN.matcher(resumeText).find();

        // ── Required sections ──
        List<String> missingSections = new ArrayList<>();
        for (String sec : REQUIRED_SECTIONS) {
            if (!lower.contains(sec)) missingSections.add(capitalize(sec));
        }

        // ── Format issues ──
        List<String> formatIssues = new ArrayList<>();
        if (lower.contains("table") || lower.contains("\\begin{tabular}"))
            formatIssues.add("Tables detected — ATS parsers struggle with tables; use plain lists instead.");
        if (countOccurrences(resumeText, "\t") > 10)
            formatIssues.add("Excessive tab characters found — may cause parsing issues.");
        // Estimate page length by word count
        int wordCount = resumeText.split("\\s+").length;
        if (wordCount > 1200)
            formatIssues.add("Resume appears long (>1200 words). Keep it to 1-2 pages for ATS and recruiters.");
        if (wordCount < 200)
            formatIssues.add("Resume appears very short (<200 words). Add more detail to your experience and skills.");
        if (!longLines.isEmpty())
            formatIssues.add("Some bullet points are too long (>25 words). Split them for readability.");
        if (!shortLines.isEmpty())
            formatIssues.add("Some bullet points are too short (<5 words). Expand them with context and impact.");

        // ── Scoring ──
        double skillScore   = normReq.isEmpty() ? 50.0 : ((double) matched.size() / normReq.size()) * 50.0;
        double expScore;
        if (requiredExp <= 0)                     expScore = 20;
        else if (expYears >= requiredExp)         expScore = 20;
        else if (expYears > 0)                    expScore = ((double) expYears / requiredExp) * 20.0;
        else                                      expScore = 0;

        double eduScore = 0;
        if (!"Not detected".equals(education)) {
            if (education.contains("PhD"))        eduScore = 15;
            else if (education.contains("Masters") || education.contains("MBA") || education.contains("MCA")) eduScore = 13;
            else if (education.contains("B.Tech") || education.contains("B.E") || education.contains("Bachelor")) eduScore = 12;
            else if (education.contains("B.Sc"))  eduScore = 10;
            else if (education.contains("Diploma")) eduScore = 7;
        }

        double keywordScore = 0;
        if (!normReq.isEmpty()) {
            long found2 = normReq.stream().filter(lower::contains).count();
            keywordScore = ((double) found2 / normReq.size()) * 15.0;
        }

        double totalScore = Math.min(100, skillScore + expScore + eduScore + keywordScore);
        totalScore = Math.round(totalScore * 10.0) / 10.0;

        // ── Build suggestions ──
        List<AtsIssue> issues = buildIssues(
            matched, missing, foundBuzzwords, foundFillers, foundActionVerbs,
            metrics, longLines, wideLines, shortLines, missingSections, formatIssues,
            hasEmail, hasPhone, hasLinkedIn, hasGitHub, education,
            expYears, requiredExp, totalScore
        );

        return ATSCheckResult.builder()
            .totalScore(totalScore).skillScore(round(skillScore))
            .experienceScore(round(expScore)).educationScore(round(eduScore))
            .keywordScore(round(keywordScore))
            .matchedSkills(matched).missingSkills(missing).extractedSkills(normExt)
            .experienceYears(expYears).education(education)
            .buzzwordsFound(foundBuzzwords).fillerWordsFound(foundFillers)
            .actionVerbsFound(foundActionVerbs).hasStrongActionVerbs(hasStrongVerbs)
            .metricsFound(metrics).hasMeasurableImpact(hasMeasurableImpact)
            .hasEmail(hasEmail).hasPhone(hasPhone)
            .hasLinkedIn(hasLinkedIn).hasGitHub(hasGitHub)
            .missingSections(missingSections).formatIssues(formatIssues)
            .issues(issues)
            .scoreLabel(getLabel(totalScore))
            .build();
    }

    // Keep original calculateScore for backward compatibility
    public ScoreResult calculateScore(String resumeText, List<String> requiredSkills, int requiredExp) {
        ATSCheckResult ats = deepAnalyze(resumeText, requiredSkills, requiredExp);
        List<String> suggestions = ats.getIssues().stream()
            .map(i -> "[" + i.getCategory() + "] " + i.getMessage())
            .collect(Collectors.toList());

        return ScoreResult.builder()
            .totalScore(ats.getTotalScore()).skillScore(ats.getSkillScore())
            .experienceScore(ats.getExperienceScore()).educationScore(ats.getEducationScore())
            .keywordScore(ats.getKeywordScore())
            .matchedSkills(ats.getMatchedSkills()).missingSkills(ats.getMissingSkills())
            .extractedSkills(ats.getExtractedSkills())
            .experienceYears(ats.getExperienceYears()).education(ats.getEducation())
            .suggestions(suggestions)
            .build();
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private List<AtsIssue> buildIssues(List<String> matched, List<String> missing, List<String> buzzwords, List<String> fillers, List<String> actionVerbs, List<String> metrics, List<String> longLines, List<String> wideLines, List<String> shortLines, List<String> missingSections, List<String> formatIssues, boolean hasEmail, boolean hasPhone, boolean hasLinkedIn, boolean hasGitHub, String education, int expYears, int requiredExp, double totalScore) {
        List<AtsIssue> list = new ArrayList<>();

        if (!hasEmail)
            list.add(new AtsIssue("Contact", "HIGH", "❌ Email address not found. Add a professional email at the top of your resume."));
        if (!hasPhone)
            list.add(new AtsIssue("Contact", "HIGH", "❌ Phone number not found. Include your 10-digit phone number."));
        if (!hasLinkedIn)
            list.add(new AtsIssue("Contact", "MEDIUM", "⚠️ LinkedIn profile URL not detected. Add linkedin.com/in/yourname to boost credibility."));
        if (!hasGitHub)
            list.add(new AtsIssue("Contact", "LOW", "💡 GitHub profile not found. Add github.com/yourusername if you have relevant projects."));

        for (String sec : missingSections)
            list.add(new AtsIssue("Structure", "HIGH", "❌ Section missing: '" + sec + "'. ATS requires standard section headings."));

        if (!missing.isEmpty()) {
            int cnt = missing.size();
            String top = missing.subList(0, Math.min(4, cnt)).stream()
                .map(s -> s.substring(0,1).toUpperCase()+s.substring(1))
                .collect(Collectors.joining(", "));
            list.add(new AtsIssue("Skills", cnt > 4 ? "HIGH" : "MEDIUM",
                "⚠️ Missing " + cnt + " required skill(s): " + top + (cnt > 4 ? " and " + (cnt-4) + " more." : ".")));
        }
        if (matched.size() >= 5)
            list.add(new AtsIssue("Skills", "PASS", "✅ Good skill match! " + matched.size() + " required skills found."));

        if (requiredExp > 0 && expYears < requiredExp)
            list.add(new AtsIssue("Experience", "HIGH",
                "⚠️ Role requires " + requiredExp + " yrs experience. Resume shows " + expYears + " yr(s). Highlight projects/internships to fill the gap."));

        if ("Not detected".equals(education))
            list.add(new AtsIssue("Education", "HIGH",
                "❌ Education not detected. Clearly state your degree, institution, and graduation year."));

        if (metrics.isEmpty())
            list.add(new AtsIssue("Impact", "HIGH",
                "❌ No measurable achievements found. Add numbers: e.g., 'Improved query speed by 40%', 'Served 10,000+ users'."));
        else if (metrics.size() < 3)
            list.add(new AtsIssue("Impact", "MEDIUM",
                "⚠️ Only " + metrics.size() + " quantified achievement(s) found. Aim for 3+ metrics."));
        else
            list.add(new AtsIssue("Impact", "PASS",
                "✅ Good measurable impact! Found: " + metrics.subList(0, Math.min(3, metrics.size())).stream().collect(Collectors.joining(", "))));

        if (actionVerbs.size() < 5)
            list.add(new AtsIssue("Writing", "MEDIUM",
                "⚠️ Weak action verbs. Use: Developed, Engineered, Optimized, Led, Deployed, Reduced, Automated."));
        else
            list.add(new AtsIssue("Writing", "PASS",
                "✅ Strong action verbs: " + actionVerbs.subList(0, Math.min(5, actionVerbs.size())).stream()
                    .map(v -> v.substring(0,1).toUpperCase()+v.substring(1)).collect(Collectors.joining(", "))));

        if (!buzzwords.isEmpty())
            list.add(new AtsIssue("Writing", "MEDIUM",
                "⚠️ Buzzwords: " + buzzwords.subList(0, Math.min(4, buzzwords.size())).stream().collect(Collectors.joining(", ")) +
                ". Replace with concrete facts."));

        if (!fillers.isEmpty())
            list.add(new AtsIssue("Writing", "MEDIUM",
                "⚠️ Weak phrases: '" + fillers.subList(0, Math.min(3, fillers.size())).stream().collect(Collectors.joining("', '")) + "'."));

        for (String fi : formatIssues)
            list.add(new AtsIssue("Format", "MEDIUM", fi));

        if (!wideLines.isEmpty())
            list.add(new AtsIssue("Format", "MEDIUM",
                "⚠️ " + wideLines.size() + " line(s) exceed standard width (>90 chars). Keep lines to 60-80 chars for ATS readability."));

        if (longLines.isEmpty() && shortLines.isEmpty() && wideLines.isEmpty() && formatIssues.isEmpty())
            list.add(new AtsIssue("Format", "PASS", "✅ Bullet point length and format look good."));

        if (totalScore >= 85)
            list.add(new AtsIssue("Overall", "PASS", "✅ Excellent ATS score! Your resume is well-optimized."));
        else if (totalScore >= 70)
            list.add(new AtsIssue("Overall", "LOW", "💡 Good score. Fine-tune keywords in your summary section."));
        else if (totalScore >= 50)
            list.add(new AtsIssue("Overall", "MEDIUM", "⚠️ Average score. Tailor this resume to the job description."));
        else
            list.add(new AtsIssue("Overall", "HIGH", "❌ Low ATS score. Fix all HIGH issues and mirror job keywords."));

        return list;
    }

    private int countOccurrences(String text, String sub) {
        int count = 0, idx = 0;
        while ((idx = text.indexOf(sub, idx)) != -1) { count++; idx++; }
        return count;
    }
    private String capitalize(String s) { return s.isEmpty() ? s : s.substring(0,1).toUpperCase()+s.substring(1); }
    private double round(double v) { return Math.round(v * 10.0) / 10.0; }
    private String getLabel(double score) {
        if (score >= 85) return "Excellent";
        if (score >= 70) return "Good";
        if (score >= 50) return "Average";
        if (score >= 30) return "Below Average";
        return "Poor";
    }

    // =========================================================================
    // DATA CLASSES
    // =========================================================================

    @lombok.Data @lombok.AllArgsConstructor
    public static class AtsIssue {
        private String category;   // Contact, Structure, Skills, Experience, Impact, Writing, Format, Overall
        private String severity;   // HIGH, MEDIUM, LOW, PASS
        private String message;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class ATSCheckResult {
        private double totalScore, skillScore, experienceScore, educationScore, keywordScore;
        private List<String> matchedSkills, missingSkills, extractedSkills;
        private int experienceYears;
        private String education, scoreLabel;
        private List<String> buzzwordsFound, fillerWordsFound, actionVerbsFound;
        private boolean hasStrongActionVerbs, hasMeasurableImpact;
        private List<String> metricsFound;
        private boolean hasEmail, hasPhone, hasLinkedIn, hasGitHub;
        private List<String> missingSections, formatIssues;
        private List<AtsIssue> issues;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class ScoreResult {
        private double totalScore, skillScore, experienceScore, educationScore, keywordScore;
        private List<String> matchedSkills, missingSkills, extractedSkills, suggestions;
        private int experienceYears;
        private String education;
    }
}
