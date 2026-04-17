package com.resume.analyzer.controller;

import com.resume.analyzer.entity.User;
import com.resume.analyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:*")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<UserProfile> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserProfile(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getContactNo(), user.getAddress(), user.getRole().name(),
                user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate().toString() : null
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest req) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (req.contactNo() != null) user.setContactNo(req.contactNo());
        if (req.address() != null) user.setAddress(req.address());
        userRepository.save(user);
        return ResponseEntity.ok(new UserProfile(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getContactNo(), user.getAddress(), user.getRole().name(),
                user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate().toString() : null
        ));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest req) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword()))
            throw new RuntimeException("Current password is incorrect");
        if (!req.newPassword().equals(req.confirmPassword()))
            throw new RuntimeException("New passwords do not match");
        if (req.newPassword().length() < 8)
            throw new RuntimeException("New password must be at least 8 characters");
        if (!req.newPassword().matches("(?=.*[A-Za-z])(?=.*\\d).*"))
            throw new RuntimeException("Password must contain at least one letter and one number");
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record UserProfile(Long id, String username, String email, String contactNo, String address, String role, String createdAt) {}
    public record UpdateProfileRequest(String contactNo, String address) {}
    public record ChangePasswordRequest(String currentPassword, String newPassword, String confirmPassword) {}
}