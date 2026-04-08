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
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationCountResponse getNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationResponse> list = notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());

        long unread = notificationRepository.countByUserAndIsReadFalse(user);

        return NotificationCountResponse.builder()
                .unreadCount(unread)
                .notifications(list)
                .build();
    }

    @Transactional
    public void markAllRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.markAllReadByUser(user);
    }

    private NotificationResponse map(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .read(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .jobId(n.getJob() != null ? n.getJob().getId() : null)
                .jobName(n.getJob() != null ? n.getJob().getJobName() : null)
                .build();
    }
}
