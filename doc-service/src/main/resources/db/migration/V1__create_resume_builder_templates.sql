CREATE TABLE IF NOT EXISTS resume_builder_templates (
    id BIGSERIAL PRIMARY KEY,
    template_code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    config_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resume_builder_documents (
    id BIGSERIAL PRIMARY KEY,
    owner_email VARCHAR(255) NOT NULL,
    template_code VARCHAR(255) NOT NULL,
    template_version INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled resume',
    resume_data_json TEXT NOT NULL DEFAULT '{}',
    section_order_json TEXT NOT NULL DEFAULT '[]',
    editor_settings_json TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_builder_documents_owner
    ON resume_builder_documents (owner_email);

CREATE INDEX IF NOT EXISTS idx_resume_builder_documents_owner_template
    ON resume_builder_documents (owner_email, template_code);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'resume_builder_templates'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE resume_builder_templates
            ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'resume_builder_templates'
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE resume_builder_templates
            ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

INSERT INTO resume_builder_templates (template_code, name, description, active, version, config_json)
VALUES
    ('classic', 'Classic', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#3b6fe0","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"classic","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"underline","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('modern', 'Modern', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#0f766e","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"modern","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"rule","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('minimal', 'Minimal', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#334155","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"minimal","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"simple","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('elegant', 'Elegant', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#2b2b2b","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"elegant","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"rule","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('compact', 'Compact', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#0891b2","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":38,"fontSize":13,"lineHeight":1.15,"fontFamily":"sans","sectionGap":16},"header":{"variant":"compact","name":{"fontSize":33,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":15,"fontWeight":600,"lineHeight":1.2},"contact":{"fontSize":12,"lineHeight":1.3,"gap":16}},"sections":{"title":{"variant":"simple","fontSize":16,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":13,"lineHeight":1.35},"spacingTop":16,"spacingBottom":8},"items":{"primary":{"fontSize":14,"fontWeight":700,"lineHeight":1.2},"secondary":{"fontSize":13,"fontWeight":600,"lineHeight":1.25},"meta":{"fontSize":12,"lineHeight":1.3},"bullet":{"fontSize":13,"lineHeight":1.35},"spacingBottom":10}}$json$),
    ('bold', 'Bold', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#2563eb","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"bold","name":{"fontSize":38,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"block","fontSize":16,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('professional', 'Professional', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#475569","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"professional","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"rule","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('timeline', 'Timeline', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#33475b","layout":{"type":"single-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"timeline","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"rule","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$),
    ('violet-rodriguez', 'Violet Rodriguez', 'Editable resume template', TRUE, 1, $json${"schemaVersion":1,"accent":"#2f7df6","layout":{"type":"two-column","sidebarSections":["skills","projects","achievements","languages","interests","awards"],"sidebarWidth":"33%","sidebarSide":"left","columnGap":32},"page":{"margin":44,"fontSize":14,"lineHeight":1.2,"fontFamily":"sans","sectionGap":20},"header":{"variant":"modern","name":{"fontSize":37,"fontWeight":700,"lineHeight":1.0},"title":{"fontSize":16,"fontWeight":600,"lineHeight":1.25},"contact":{"fontSize":13,"lineHeight":1.35,"gap":20}},"sections":{"title":{"variant":"rule","fontSize":18,"fontWeight":700,"lineHeight":1.2},"body":{"fontSize":14,"lineHeight":1.45},"spacingTop":20,"spacingBottom":10},"items":{"primary":{"fontSize":16,"fontWeight":700,"lineHeight":1.25},"secondary":{"fontSize":14,"fontWeight":600,"lineHeight":1.3},"meta":{"fontSize":13,"lineHeight":1.35},"bullet":{"fontSize":14,"lineHeight":1.4},"spacingBottom":16}}$json$)
ON CONFLICT (template_code) DO UPDATE
SET config_json = EXCLUDED.config_json
WHERE resume_builder_templates.config_json NOT LIKE '%"schemaVersion"%';

INSERT INTO resume_builder_templates (template_code, name, description, active, version, config_json)
SELECT variants.template_code,
       variants.name,
       'Editable resume template',
       TRUE,
       1,
       source.config_json
FROM (
    VALUES
        ('ankita-tiwari', 'Ankita Tiwari', 'modern'),
        ('margarita-perez', 'Margarita Perez', 'elegant'),
        ('william-lucas', 'William Lucas', 'classic'),
        ('jake-s-resume', 'Jake''s Resume', 'minimal'),
        ('zayden', 'Zayden', 'bold'),
        ('dr-sameer', 'Dr Sameer', 'professional'),
        ('mr-abrahm', 'Mr Abrahm', 'classic'),
        ('dr-emily-chen', 'Dr. Emily Chen', 'elegant'),
        ('raman-singh', 'Raman Singh', 'elegant'),
        ('michael-rodriguez', 'Michael Rodriguez', 'modern'),
        ('priya-sharma', 'Priya Sharma', 'professional'),
        ('kumar-mukesh', 'Kumar Mukesh', 'classic')
) AS variants(template_code, name, source_template_code)
JOIN resume_builder_templates source ON source.template_code = variants.source_template_code
ON CONFLICT (template_code) DO UPDATE
SET config_json = EXCLUDED.config_json
WHERE resume_builder_templates.config_json NOT LIKE '%"schemaVersion"%';