package com.docservice.careerhub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OtpMailer {

    private static final Logger LOGGER = LoggerFactory.getLogger(OtpMailer.class);
    private static final String SUBJECT = "Your verification code";

    @Autowired
    private MailService mailService;

    public void send(String toEmail, String otp) {
        String text = "Your verification code is " + otp + ". It expires in 5 minutes.";
        String html = mailService.render("otp.html", Map.of("otp", otp));
        if (!mailService.sendHtml(toEmail, SUBJECT, text, html)) {
            LOGGER.warn("Mail not sent — OTP for {} is {}", toEmail, otp);
        }
    }
}
