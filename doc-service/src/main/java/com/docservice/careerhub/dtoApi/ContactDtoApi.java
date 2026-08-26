package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.MailRequest;
import com.docservice.careerhub.dto.request.ContactRequest;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.service.ContactMailer;
import com.docservice.careerhub.service.MailService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import com.docservice.careerhub.util.EmailBodies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ContactDtoApi extends AbstractDtoUtil {

    @Autowired
    private ContactMailer contactMailer;

    @Autowired
    private MailService mailService;

    @com.docservice.careerhub.audit.Auditable(
            action = com.docservice.careerhub.dto.constants.AuditAction.CONTACT_SUBMITTED,
            actor = "#request.email")
    public MessageResponse submit(ContactRequest request) {
        validate(request);
        boolean ok = contactMailer.send(request);
        return MessageResponse.of(ok
                ? "Your message has been sent. We'll get back to you soon."
                : "Could not send your message right now. Please email support directly.");
    }

    public MessageResponse sendAdminMail(MailRequest request) {
        validate(request);
        String html = mailService.renderEmail(EmailBodies.message(request.getSubject(), request.getMessage()));
        boolean ok = mailService.sendHtml(request.getTo(), request.getSubject(), request.getMessage(), html);
        return MessageResponse.of(ok
                ? "Email sent to " + request.getTo()
                : "Could not send the email (mail not configured?).");
    }
}
