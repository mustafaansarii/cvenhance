package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.response.EntitlementResponse;
import com.docservice.careerhub.service.EntitlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EntitlementController {

    @Autowired
    private EntitlementService entitlementService;

    @GetMapping("/api/me/entitlement")
    public EntitlementResponse entitlement(Authentication authentication) {
        return entitlementService.describe(authentication.getName());
    }
}
