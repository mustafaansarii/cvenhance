package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.request.MailRequest;
import com.docservice.careerhub.dto.request.ContactRequest;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.dtoApi.ContactDtoApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactDtoApi contactDtoApi;

    @PostMapping
    public MessageResponse submit(@RequestBody ContactRequest request) {
        return contactDtoApi.submit(request);
    }

    @PostMapping("/admin/send")
    public MessageResponse adminSend(@RequestBody MailRequest request) {
        return contactDtoApi.sendAdminMail(request);
    }
}
