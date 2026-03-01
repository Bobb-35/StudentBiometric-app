package com.biometric.service;

import com.biometric.model.PasswordResetToken;
import com.biometric.model.User;
import com.biometric.repository.PasswordResetTokenRepository;
import com.biometric.repository.UserRepository;
import com.resend.Resend;
import com.resend.services.emails.model.SendEmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    @Autowired
    private UserService userService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.password-reset.expiry-minutes:30}")
    private long expiryMinutes;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${resend.api-key:}")
    private String resendApiKey;

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
        if (isBlank(resendApiKey)) {
            log.info("Resend API key not configured. Password reset link for {}: {}", to, resetUrl);
            return false;
        }

        try {
            Resend resend = new Resend(resendApiKey);
            SendEmailRequest request = SendEmailRequest.builder()
                .from(fromEmail)
                .to(to)
                .subject("Biometric Attendance Password Reset")
                .html(
                    "<p>You requested a password reset.</p>" +
                    "<p>Click the link below to reset your password:</p>" +
                    "<p><a href=\"" + resetUrl + "\">Reset Password</a></p>" +
                    "<p>This link expires in " + expiryMinutes + " minutes.</p>"
                )
                .build();

            resend.emails().send(request);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send password reset email via Resend to {}. Reset link: {}", to, resetUrl, ex);
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
