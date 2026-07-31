package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.dto.request.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/** Composes and sends a contact-form query to the support inbox (reply-to = the user). */
@Service
public class ContactMailer {

    private static final Logger LOGGER = LoggerFactory.getLogger(ContactMailer.class);

    @Autowired
    private MailService mailService;

    @Autowired
    private AppProperties appProperties;

    public boolean send(ContactRequest request) {
        String subject = "New contact query from " + request.getName();
        String text = "From: " + request.getName() + " (" + request.getEmail() + ")\n\n" + request.getMessage();
        String html = mailService.renderEmail("contact.html", Map.of(
                "name", request.getName(),
                "email", request.getEmail(),
                "message", request.getMessage()));

        boolean sent = mailService.sendHtml(appProperties.getMailSupportAddress(), subject, text, html, request.getEmail());
        if (!sent) {
            LOGGER.warn("Contact query from {} could not be delivered to support", request.getEmail());
        }
        return sent;
    }
}
