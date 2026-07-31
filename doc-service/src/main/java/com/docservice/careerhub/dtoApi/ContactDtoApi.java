package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.ContactRequest;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.service.ContactMailer;
import com.docservice.careerhub.util.AbstractDtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ContactDtoApi extends AbstractDtoUtil {

    @Autowired
    private ContactMailer contactMailer;

    public MessageResponse submit(ContactRequest request) {
        validate(request);
        boolean ok = contactMailer.send(request);
        return MessageResponse.of(ok
                ? "Your message has been sent. We'll get back to you soon."
                : "Could not send your message right now. Please email support directly.");
    }
}
