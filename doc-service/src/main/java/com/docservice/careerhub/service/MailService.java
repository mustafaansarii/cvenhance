package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MailService.class);
    private static final String OTP_SUBJECT = "Your verification code";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private AppProperties appProperties;

    public void sendOtp(String toEmail, String otp) {
        String body = "Your verification code is " + otp + ". It expires in 5 minutes.";
        String html = """
            <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
                <h2 style="margin-bottom: 10px; color: #2c3e50;">CVEnhance</h2>

                <p>Hello,</p>

                <p>Your verification code is:</p>

                <h1 style="color: #2563eb; letter-spacing: 4px; margin: 10px 0;">%s</h1>

                <p>This code is valid for <strong>5 minutes</strong>.</p>

                <p>If you didn't request this verification code, you can safely ignore this email.</p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

                <p>
                    Regards,<br>
                    <strong>CVEnhance Team</strong><br>
                    🌐 <a href="https://cvenhance.in"
                        style="color: #2563eb; text-decoration: none;"
                        target="_blank">
                        https://cvenhance.in
                    </a>
                </p>
            </div>
            """.formatted(otp);
            
        if (send(toEmail, OTP_SUBJECT, body, html)) {
            return;
        }
        LOGGER.warn("Mail not sent — OTP for {} is {}", toEmail, otp);
    }

    private boolean send(String toEmail, String subject, String text, String html) {
        String apiKey = appProperties.getResendApiKey();
        String from = fromAddress();
        if (apiKey != null && !apiKey.isBlank() && from != null && !from.isBlank()) {
            try {
                Resend resend = new Resend(apiKey);
                CreateEmailOptions options = CreateEmailOptions.builder()
                        .from(from)
                        .to(toEmail)
                        .subject(subject)
                        .html(html)
                        .text(text)
                        .build();
                resend.emails().send(options);
                return true;
            } catch (Exception exception) {
                LOGGER.error("Resend email to {} failed: {}", toEmail, exception.getMessage(), exception);
                return false;
            }
        }

        if (mailSender != null && from != null && !from.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(from);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                return true;
            } catch (Exception exception) {
                LOGGER.error("SMTP email to {} failed: {}", toEmail, exception.getMessage(), exception);
                return false;
            }
        }
        return false;
    }

    private String fromAddress() {
        String configured = appProperties.getMailFromAddress();
        if (configured != null && !configured.isBlank()) {
            return configured;
        }
        return appProperties.getMailFrom();
    }
}
