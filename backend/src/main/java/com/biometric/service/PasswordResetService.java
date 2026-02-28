package com.biometric.service;

import com.biometric.model.PasswordResetToken;
import com.biometric.model.User;
import com.biometric.repository.PasswordResetTokenRepository;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired(required = false)
    private JavaMailSender mailSender;
    @Autowired
    private UserService userService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.password-reset.expiry-minutes:30}")
    private long expiryMinutes;

    @Value("${spring.mail.username:no-reply@biometric.local}")
    private String fromEmail;

    @Transactional
    public void sendResetLink(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        tokenRepository.deleteByUserId(user.getId());
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());

        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        PasswordResetToken saved = tokenRepository.save(token);

        String resetUrl = frontendUrl + "/reset-password?token=" + saved.getToken();
        sendMail(user.getEmail(), resetUrl);
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (token.isUsed() || token.isExpired()) {
            throw new RuntimeException("Reset token is invalid or expired");
        }

        userService.resetPassword(token.getUserId(), newPassword);
        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);
    }

    private void sendMail(String to, String resetUrl) {
        if (mailSender == null) {
            System.out.println("Password reset link for " + to + ": " + resetUrl);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Biometric Attendance Password Reset");
        message.setText(
            "You requested a password reset.\n\n" +
            "Click the link below to reset your password:\n" + resetUrl + "\n\n" +
            "This link expires in " + expiryMinutes + " minutes."
        );
        mailSender.send(message);
    }
}
