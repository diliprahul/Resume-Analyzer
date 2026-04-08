package com.resume.analyzer.repository;

import com.resume.analyzer.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderByFeedbackDateDesc();
}
