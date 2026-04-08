package com.resume.analyzer.config;

import com.resume.analyzer.entity.User;
import com.resume.analyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@resumeanalyzer.com")
                    .password(passwordEncoder.encode("admin123"))
                    .contactNo("0000000000")
                    .address("Admin Office")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created — username: admin / password: admin123");
        } else {
            log.info("Admin user already exists");
        }
    }
}
