package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.dto.ai.Profile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ResumeImportServiceTest {

    private AiService aiService;
    private ResumeImportService service;

    @BeforeEach
    void setUp() {
        aiService = mock(AiService.class);
        service = new ResumeImportService();
        ReflectionTestUtils.setField(service, "aiService", aiService);
        ReflectionTestUtils.setField(service, "objectMapper", new ObjectMapper());
    }

    @Test
    void aiResultIsMappedToProfileDataMap() {
        Profile profile = new Profile("Grace", "SF", "1", "g@x.com", "li", "liUrl",
                "gh", "ghUrl", "summary",
                List.of(new Profile.Education("MIT", "BSc", "MA", "2018-2022")),
                List.of(new Profile.Skill("Languages", "Java")),
                List.of(new Profile.Experience("Acme", "SWE", "Remote", "2022-now", List.of("did x"))),
                List.of(), List.of("award"));
        when(aiService.generate(any(AiRequest.class), eq(Profile.class))).thenReturn(profile);

        Map<String, Object> out = ReflectionTestUtils.invokeMethod(service, "parseProfileWithAi", "some resume text");

        assertThat(out.get("name")).isEqualTo("Grace");
        assertThat((List<?>) out.get("skills")).hasSize(1);
        assertThat((List<String>) out.get("achievements")).containsExactly("award");
    }
}
