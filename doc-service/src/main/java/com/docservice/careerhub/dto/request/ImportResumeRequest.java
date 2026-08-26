package com.docservice.careerhub.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ImportResumeRequest {

    @Size(max = 30000, message = "resumeText must be at most 30000 characters")
    private String resumeText;

    @Size(max = 20000, message = "jobDescription must be at most 20000 characters")
    private String jobDescription;

}
