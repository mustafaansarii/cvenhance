package com.docservice.careerhub.service;

import com.docservice.careerhub.util.EmailBodies;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AccountMailer {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccountMailer.class);

    @Autowired
    private MailService mailService;

    @Async
    public void sendWelcome(String toEmail, String name) {
        try {
            String html = mailService.renderEmail(EmailBodies.welcome(name));
            mailService.sendHtml(toEmail, "Welcome to CVEnhance 🎉", "Welcome Back to CVEnhance!", html);
        } catch (Exception exception) {
            LOGGER.warn("Welcome email to {} failed: {}", toEmail, exception.getMessage());
        }
    }

    @Async
    public void sendTemplateUnlocked(String toEmail, String name, String templateName) {
        try {
            String html = mailService.renderEmail(EmailBodies.templateUnlocked(name, templateName));
            mailService.sendHtml(toEmail, "Your resume is unlocked 🎉", "Your resume is unlocked.", html);
        } catch (Exception exception) {
            LOGGER.warn("Unlock email to {} failed: {}", toEmail, exception.getMessage());
        }
    }

    @Async
    public void sendResumeAssigned(String toEmail, String name) {
        try {
            String html = mailService.renderEmail(EmailBodies.resumeAssigned(name));
            mailService.sendHtml(toEmail, "A resume was added to your account 🎉", "A resume was added to your account.", html);
        } catch (Exception exception) {
            LOGGER.warn("Resume-assigned email to {} failed: {}", toEmail, exception.getMessage());
        }
    }
}
