package com.resume.analyzer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    private boolean isEmailConfigured() {
        return fromEmail != null
                && !fromEmail.isBlank()
                && !fromEmail.equals("your-email@gmail.com");
    }

    @Async
    public void sendJobAlert(String toEmail, String userName,
                             String jobName, String company,
                             String salary, String skills) {
        if (!isEmailConfigured()) {
            log.info("Email not configured — skipping job alert to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("New Job Alert: " + jobName + " at " + company);
            msg.setText(
                "Hi " + userName + ",\n\n" +
                "A new job has been posted that might interest you!\n\n" +
                "Job Title  : " + jobName + "\n" +
                "Company    : " + company + "\n" +
                "Salary     : " + salary + "\n" +
                "Skills     : " + skills + "\n\n" +
                "Login to ResumeAnalyzer to view the full details and upload your resume.\n\n" +
                "Best Regards,\nResumeAnalyzer Team"
            );
            mailSender.send(msg);
            log.info("Job alert sent to {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        if (!isEmailConfigured()) {
            log.info("Email not configured — skipping welcome email to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("Welcome to ResumeAnalyzer!");
            msg.setText(
                "Hi " + userName + ",\n\n" +
                "Welcome to ResumeAnalyzer!\n\n" +
                "You can now:\n" +
                "- Browse job listings\n" +
                "- Upload your resume for analysis\n" +
                "- Get your ATS score and skill gap analysis\n" +
                "- Receive job alerts when new positions are posted\n\n" +
                "Best Regards,\nResumeAnalyzer Team"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Welcome email failed for {}: {}", toEmail, e.getMessage());
        }
    }
}
