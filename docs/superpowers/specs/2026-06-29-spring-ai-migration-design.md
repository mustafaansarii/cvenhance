# Spring AI Migration for `ai-service` — Design

**Date:** 2026-06-29
**Status:** Approved (design)
**Scope:** Replace the hand-rolled Gemini `RestClient` in `ai-service` with Spring AI's `ChatClient`, upgrade Spring Boot 3.2.5 → 3.4.x across the modules, and convert the resume parser to typed structured output.

## Goals
- Use Spring AI's `ChatClient` instead of a hand-built HTTP call + manual response parsing.
- Keep the **API-key Google GenAI** path (Gemini via `generativelanguage.googleapis.com`); no GCP/Vertex.
- Parse résumés into a **typed `Profile` POJO** via Spring AI structured output (drop the code-fence stripping + manual Jackson parse).
- Preserve the `AiService` façade so consumers don't change.

## Non-goals
- No Vertex AI / GCP service-account auth.
- No new AI features (the interview chatbot is separate, future work).
- No change to `LatexMergeService`, `profileData` storage format, or any consumer API shape.

## Current state
- `ai-service` (`AiService`, `AiRequest`, `AiException`) is a thin library consumed by `doc-service`.
- `AiService.generate(AiRequest): String` builds the Gemini `contents`/`system_instruction`/`generationConfig` payload by hand via `RestClient` and digs `candidates[0].content.parts[0].text`.
- Config keys: `openai.apiKey`, `openai.modelName` (misleading — it's Gemini).
- Consumers: `AiController` (`POST /api/ai/generate`) and `ResumeImportService` (`POST /api/profile/import-resume`), which strips code fences and `ObjectMapper`-parses the JSON.
- Spring Boot **3.2.5**, Java **21**. The runnable app is `doc-service`, bundling `ai-service` + `payment-service` as libraries.

## Version & module strategy
- Spring AI 1.0.x requires **Boot 3.4.x**. Because `doc-service` bundles the libs on one classpath, **all three modules** (`doc-service`, `ai-service`, `payment-service`) move to the same Boot **3.4.x** (Java 21 unchanged).
- Add the **Spring AI BOM** for version management; `ai-service` adds the **Spring AI Google GenAI starter** (API-key Gemini). Exact artifact id + property names to be pinned from the Spring AI 1.0.x BOM during implementation.
- **Primary risk is the Boot 3.4 upgrade itself** (Spring Security 6.4, Hibernate, jjwt, pdfbox, poi), independent of Spring AI.

## Components & changes
### `AiService` façade (public API preserved)
- Keep `generate(AiRequest): String` and `generate(String): String`.
- Add `<T> T generate(AiRequest, Class<T>): T` for typed structured output — `ai-service` remains the single AI entry point; consumers never touch `ChatClient`.
- Internals: inject `ChatClient` (built from the autoconfigured Google GenAI `ChatModel`).
  - Text: `chatClient.prompt().system(req.system()).user(req.prompt()).options(temperature).call().content()`.
  - Typed: `...call().entity(type)`.
- Preserve `AiException` wrapping for transient/parse failures; enable `spring.ai.retry.*` for transient errors.

### Resume parser → typed structured output
- New `Profile` record + nested records (`Experience`, `Education`, `Skill`, `Project`) mirroring `sample-resume.json` (name, location, phone, email, linkedin, linkedinUrl, github, githubUrl, summary, education[], skills[]{label,value}, experience[]{company,role,location,period,bullets[]}, projects[]{name,tech,githubUrl,liveUrl,bullets[]}, achievements[]).
- `ResumeImportService.parseProfileWithAi` → `aiService.generate(req, Profile.class)`; **delete `stripCodeFences` + manual parse**.
- Convert `Profile` → `Map<String,Object>` via `objectMapper.convertValue(...)` and store as `profileData` (storage format unchanged; downstream untouched).
- `extractText` / `saveProfile` unchanged.

### Config / secrets
- Rename `openai.apiKey` / `openai.modelName` → `spring.ai.google.genai.*`, bound from env **`GEMINI_API_KEY`** + **`GEMINI_MODEL`** (default `gemini-flash-latest`).
- Update `application.yml`, `doc-service/.env`, and Render env vars. (Rotate the leaked key during this change.)

## Error handling
- Map Spring AI exceptions to `AiException` at the façade (keep current messages: missing key, empty response, parse failure).
- Configure Spring AI retry for transient API errors.

## Testing
- Unit: `AiService` with a mocked `ChatModel`/`ChatClient`; `ResumeImportService` with a mocked `aiService.generate(..., Profile.class)`.
- Run the **full suite on Java 21** (`JAVA_HOME=temurin-21`).
- Post-Boot-3.4 regression: SecurityConfig/JWT filter, OAuth2 login, pdfbox PDF compile, poi DOCX extraction.
- Manual smoke: `/api/ai/generate` and `/api/profile/import-resume` with a real Gemini key in a dev profile.

## Rollout — two phases
- **PR1:** Boot 3.2.5 → 3.4 across all three modules; no behavior change; tests green.
- **PR2:** Spring AI swap — `ChatClient` behind `AiService`, typed `Profile` parser, config rename.

## Success criteria
- `/api/ai/generate` returns Gemini text via Spring AI.
- Résumé import produces the same `profileData` shape, parsed into `Profile` then mapped to `Map`, with no code-fence/Jackson hack.
- All existing tests pass on Java 21; manual smoke tests pass.
