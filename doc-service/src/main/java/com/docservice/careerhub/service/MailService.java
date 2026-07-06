package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.samskivert.mustache.Mustache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class MailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MailService.class);
    private static final String TEMPLATE_PATH = "templates/emails/";

    private final Mustache.Compiler templateCompiler = Mustache.compiler().defaultValue("");

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private AppProperties appProperties;

    public boolean send(String toEmail, String subject, String text) {
        return dispatch(toEmail, subject, text, null);
    }

    public boolean sendHtml(String toEmail, String subject, String text, String html) {
        return dispatch(toEmail, subject, text, html);
    }

    public String render(String templateName, Map<String, Object> data) {
        try (var in = new ClassPathResource(TEMPLATE_PATH + templateName).getInputStream()) {
            String template = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            return templateCompiler.compile(template).execute(data);
        } catch (IOException exception) {
            throw new IllegalStateException("Email template not found: " + templateName, exception);
        }
    }

// -----------------Helper emthods--------------------

    private boolean dispatch(String toEmail, String subject, String text, String html) {
        String from = fromAddress();
        if (!StringUtils.hasText(from)) {
            LOGGER.warn("No sender address configured — email to {} not sent", toEmail);
            return false;
        }
        if (StringUtils.hasText(appProperties.getResendApiKey())) {
            return sendViaResend(from, toEmail, subject, text, html);
        }
        if (mailSender != null) {
            return sendViaSmtp(from, toEmail, subject, text);
        }
        LOGGER.warn("No email provider configured — email to {} not sent", toEmail);
        return false;
    }

    private boolean sendViaResend(String from, String toEmail, String subject, String text, String html) {
        try {
            CreateEmailOptions.Builder options = CreateEmailOptions.builder()
                    .from(from)
                    .to(toEmail)
                    .subject(subject)
                    .text(text);
            if (StringUtils.hasText(html)) {
                options.html(html);
            }
            new Resend(appProperties.getResendApiKey()).emails().send(options.build());
            return true;
        } catch (Exception exception) {
            LOGGER.error("Resend email to {} failed: {}", toEmail, exception.getMessage(), exception);
            return false;
        }
    }

    private boolean sendViaSmtp(String from, String toEmail, String subject, String text) {
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

    private String fromAddress() {
        String configured = appProperties.getMailFromAddress();
        return StringUtils.hasText(configured) ? configured : appProperties.getMailFrom();
    }
}
