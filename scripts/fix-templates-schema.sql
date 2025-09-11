-- Fix templates table schema issues
-- 1. Ensure active_version_id column exists
-- 2. Ensure template_name column exists

-- Add active_version_id if it doesn't exist
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS active_version_id UUID 
REFERENCES template_versions(id) ON DELETE SET NULL;

-- Add template_name if it doesn't exist (fallback for name column)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS template_name VARCHAR(255);

-- If we have a 'name' column but no 'template_name', copy the data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'templates' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM templates WHERE template_name IS NOT NULL LIMIT 1
    ) THEN
        UPDATE templates SET template_name = name WHERE template_name IS NULL;
    END IF;
END $$;

-- Make template_name NOT NULL if it has data
ALTER TABLE templates 
ALTER COLUMN template_name SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_active_version_id 
ON templates(active_version_id);

CREATE INDEX IF NOT EXISTS idx_templates_name 
ON templates(template_name);

-- Update existing templates to have their first version as active if null
UPDATE templates 
SET active_version_id = (
    SELECT tv.id 
    FROM template_versions tv 
    WHERE tv.template_id = templates.id 
    ORDER BY tv.version_number ASC 
    LIMIT 1
)
WHERE active_version_id IS NULL
AND EXISTS (
    SELECT 1 FROM template_versions tv 
    WHERE tv.template_id = templates.id
);