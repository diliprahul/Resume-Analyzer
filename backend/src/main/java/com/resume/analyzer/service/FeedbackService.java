package com.resume.analyzer.service;

import com.resume.analyzer.dto.Dtos.*;
import com.resume.analyzer.entity.*;
import com.resume.analyzer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeedbackResponse submitFeedback(String username, FeedbackRequest req) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback fb = Feedback.builder()
                .user(user)
                .feedbackText(req.getFeedbackText())
                .rating(req.getRating())
                .build();

        fb = feedbackRepository.save(fb);
        return map(fb);
    }

    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAllByOrderByFeedbackDateDesc()
                .stream().map(this::map).collect(Collectors.toList());
    }

    private FeedbackResponse map(Feedback fb) {
        return FeedbackResponse.builder()
                .id(fb.getId())
                .username(fb.getUser() != null ? fb.getUser().getUsername() : "Anonymous")
                .feedbackText(fb.getFeedbackText())
                .rating(fb.getRating())
                .feedbackDate(fb.getFeedbackDate())
                .build();
    }
}
