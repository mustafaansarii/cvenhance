package com.docservice.careerhub.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SeedBulletRequest {
    /** Role/job title this bullet bank entry targets (e.g. 'Java Backend Engineer'). */
    private String role;
    /** Resume section (e.g. 'experience', 'projects', 'skills', 'summary'). */
    private String section;
    /** List of high-quality recruiter-approved bullet texts to seed. */
    private List<String> bullets;
}
