package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.samskivert.mustache.Mustache;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class MailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MailService.class);
    private static final String TEMPLATE_PATH = "templates/emails/";
    private static final String LAYOUT = "layout.html";

    private final Mustache.Compiler templateCompiler = Mustache.compiler().defaultValue("");

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private AppProperties appProperties;

    public boolean send(String toEmail, String subject, String text) {
        return dispatch(toEmail, subject, text, null, null);
    }

    public boolean sendHtml(String toEmail, String subject, String text, String html) {
        return dispatch(toEmail, subject, text, html, null);
    }

    public boolean sendHtml(String toEmail, String subject, String text, String html, String replyTo) {
        return dispatch(toEmail, subject, text, html, replyTo);
    }

    public String renderEmail(String bodyHtml) {
        return render(LAYOUT, Map.of("body", bodyHtml == null ? "" : bodyHtml));
    }

    private String render(String templateName, Map<String, Object> data) {
        try (var in = new ClassPathResource(TEMPLATE_PATH + templateName).getInputStream()) {
            String template = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            return templateCompiler.compile(template).execute(data);
        } catch (IOException exception) {
            throw new IllegalStateException("Email template not found: " + templateName, exception);
        }
    }

    // -----------------Helper methods--------------------

    /** Try Resend first; if it isn't configured or fails, fall back to SMTP. */
    private boolean dispatch(String toEmail, String subject, String text, String html, String replyTo) {
        String from = fromAddress();
        if (!StringUtils.hasText(from)) {
            LOGGER.warn("No sender address configured — email to {} not sent", toEmail);
            return false;
        }

        if (StringUtils.hasText(appProperties.getResendApiKey())
                && sendViaResend(from, toEmail, subject, text, html, replyTo)) {
            return true;
        }

        if (mailSender != null && sendViaSmtp(from, toEmail, subject, text, html, replyTo)) {
            return true;
        }

        LOGGER.warn("Email to {} could not be delivered by any provider", toEmail);
        return false;
    }

    private boolean sendViaResend(String from, String toEmail, String subject, String text, String html, String replyTo) {
        try {
            CreateEmailOptions.Builder options = CreateEmailOptions.builder()
                    .from(from)
                    .to(toEmail)
                    .subject(subject)
                    .text(text);
            if (StringUtils.hasText(html)) {
                options.html(html);
            }
            if (StringUtils.hasText(replyTo)) {
                options.replyTo(replyTo);
            }
            new Resend(appProperties.getResendApiKey()).emails().send(options.build());
            return true;
        } catch (Exception exception) {
            LOGGER.error("Resend email to {} failed, will try SMTP: {}", toEmail, exception.getMessage());
            return false;
        }
    }

    private boolean sendViaSmtp(String from, String toEmail, String subject, String text, String html, String replyTo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            if (StringUtils.hasText(html)) {
                helper.setText(text == null ? "" : text, html); // text + HTML alternative
            } else {
                helper.setText(text == null ? "" : text);
            }
            if (StringUtils.hasText(replyTo)) {
                helper.setReplyTo(replyTo);
            }
            mailSender.send(message);
            return true;
        } catch (Exception exception) {
            LOGGER.error("SMTP email to {} failed: {}", toEmail, exception.getMessage());
            return false;
        }
    }

    private String fromAddress() {
        String configured = appProperties.getMailFromAddress();
        return StringUtils.hasText(configured) ? configured : appProperties.getMailFrom();
    }
}
