package com.docservice.careerhub.service;

import com.docservice.careerhub.util.EmailBodies;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OtpMailer {

    private static final Logger LOGGER = LoggerFactory.getLogger(OtpMailer.class);
    private static final String SUBJECT = "Your verification code";

    @Autowired
    private MailService mailService;

    public void send(String toEmail, String otp) {
        String text = "Your verification code is " + otp + ". It expires in 5 minutes.";
        String html = mailService.renderEmail(EmailBodies.otp(otp));
        if (!mailService.sendHtml(toEmail, SUBJECT, text, html)) {
            LOGGER.warn("Mail not sent — OTP for {} is {}", toEmail, otp);
        }
    }
}
