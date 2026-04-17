package com.resume.analyzer.repository;

import com.resume.analyzer.entity.ResumeSubmission;
import com.resume.analyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ResumeSubmissionRepository extends JpaRepository<ResumeSubmission, Long> {
    List<ResumeSubmission> findByUserOrderByUploadDateDesc(User user);
    List<ResumeSubmission> findByJobIdOrderByScoreDesc(Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    void deleteByJobId(Long jobId);

    @Query("SELECT s FROM ResumeSubmission s JOIN FETCH s.job JOIN FETCH s.user")
    List<ResumeSubmission> findAllWithDetails();

    @Query("SELECT s FROM ResumeSubmission s JOIN FETCH s.job JOIN FETCH s.user WHERE s.job.id = :jobId ORDER BY s.score DESC")
    List<ResumeSubmission> findByJobIdWithDetails(@Param("jobId") Long jobId);

    @Query("SELECT s FROM ResumeSubmission s LEFT JOIN FETCH s.job LEFT JOIN FETCH s.user WHERE s.user.id = :userId ORDER BY s.uploadDate DESC")
    List<ResumeSubmission> findByUserIdWithDetails(@Param("userId") Long userId);
}
