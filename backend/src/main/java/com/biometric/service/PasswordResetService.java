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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

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

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Transactional
    public ForgotPasswordResult sendResetLink(String email) {
        if (isBlank(email)) {
            return new ForgotPasswordResult(false, null, false);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new ForgotPasswordResult(false, null, false);
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
        boolean delivered = sendMail(user.getEmail(), resetUrl);
        return new ForgotPasswordResult(delivered, delivered ? null : resetUrl, true);
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

    private boolean sendMail(String to, String resetUrl) {
        if (mailSender == null || isBlank(mailHost)) {
            log.info("SMTP not configured. Password reset link for {}: {}", to, resetUrl);
            return false;
        }

        try {
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
            return true;
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}. Reset link: {}", to, resetUrl, ex);
            return false;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static class ForgotPasswordResult {
        private final boolean delivered;
        private final String fallbackResetUrl;
        private final boolean accountFound;

        public ForgotPasswordResult(boolean delivered, String fallbackResetUrl, boolean accountFound) {
            this.delivered = delivered;
            this.fallbackResetUrl = fallbackResetUrl;
            this.accountFound = accountFound;
        }

        public boolean isDelivered() {
            return delivered;
        }

        public String getFallbackResetUrl() {
            return fallbackResetUrl;
        }

        public boolean isAccountFound() {
            return accountFound;
        }
    }
}
