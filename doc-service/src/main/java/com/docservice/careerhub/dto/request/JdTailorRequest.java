package com.docservice.careerhub.dto.request;

import lombok.Data;

@Data
public class JdTailorRequest {
    /** The user's current resume text (plain text or LaTeX). */
    private String resumeText;
    /** The full job description to tailor towards. */
    private String jobDescription;
    /** Optional: the specific resume section being tailored (e.g. 'experience'). */
    private String section;
}
