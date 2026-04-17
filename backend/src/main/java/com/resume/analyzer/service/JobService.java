package com.resume.analyzer.service;

import com.resume.analyzer.dto.Dtos.*;
import com.resume.analyzer.entity.*;
import com.resume.analyzer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ResumeSubmissionRepository resumeSubmissionRepository;
    private final EmailService emailService;

    @Transactional
    public JobResponse postJob(JobRequest req) {
        Job job = Job.builder()
                .jobName(req.getJobName())
                .jobDetails(req.getJobDetails())
                .companyName(req.getCompanyName())
                .salary(req.getSalary())
                .skills(req.getSkills())
                .requiredExperienceYears(req.getRequiredExperienceYears())
                .active(true)
                .build();

        job = jobRepository.save(job);
        sendAlertsToAllUsers(job);
        return mapToResponse(job, false);
    }

    private void sendAlertsToAllUsers(Job job) {
        List<User> users = userRepository.findByRole(User.Role.USER);
        String skillsText = job.getSkills() != null ? String.join(", ", job.getSkills()) : "";
        for (User user : users) {
            try {
                Notification notif = Notification.builder()
                        .user(user).job(job)
                        .message("New job posted: " + job.getJobName() + " at " + job.getCompanyName())
                        .isRead(false).build();
                notificationRepository.save(notif);
                emailService.sendJobAlert(user.getEmail(), user.getUsername(),
                        job.getJobName(), job.getCompanyName(),
                        job.getSalary() != null ? job.getSalary() : "Not specified", skillsText);
            } catch (Exception e) {
                log.error("Failed to send alert to user {}: {}", user.getUsername(), e.getMessage());
                // Continue with other users even if one fails
            }
        }
        log.info("Job alerts sent to {} users for job: {}", users.size(), job.getJobName());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllActiveJobs(String currentUsername) {
        User user = currentUsername != null
                ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return jobRepository.findByActiveTrueOrderByPostDateDesc().stream()
                .map(job -> {
                    boolean applied = user != null
                            && resumeSubmissionRepository.existsByUserIdAndJobId(user.getId(), job.getId());
                    return mapToResponse(job, applied);
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAllWithSkills().stream()
                .map(j -> mapToResponse(j, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id, String username) {
        Job job = jobRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User user = username != null
                ? userRepository.findByUsername(username).orElse(null) : null;
        boolean applied = user != null
                && resumeSubmissionRepository.existsByUserIdAndJobId(user.getId(), id);
        return mapToResponse(job, applied);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        // Delete associated notifications and resume submissions first
        notificationRepository.deleteByJobId(id);
        resumeSubmissionRepository.deleteByJobId(id);
        jobRepository.delete(job);
    }

    private JobResponse mapToResponse(Job job, boolean applied) {
        return JobResponse.builder()
                .id(job.getId())
                .jobName(job.getJobName())
                .jobDetails(job.getJobDetails())
                .companyName(job.getCompanyName())
                .salary(job.getSalary())
                .skills(job.getSkills())
                .postDate(job.getPostDate())
                .requiredExperienceYears(job.getRequiredExperienceYears())
                .alreadyApplied(applied)
                .build();
    }
}
