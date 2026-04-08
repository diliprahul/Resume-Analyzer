package com.resume.analyzer.repository;

import com.resume.analyzer.entity.ResumeSubmission;
import com.resume.analyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeSubmissionRepository extends JpaRepository<ResumeSubmission, Long> {
    List<ResumeSubmission> findByUserOrderByUploadDateDesc(User user);
    List<ResumeSubmission> findByJobIdOrderByScoreDesc(Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}
