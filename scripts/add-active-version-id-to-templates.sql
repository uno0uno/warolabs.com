-- Add active_version_id column to templates table
-- This column will reference the currently active template version

-- First, add the column without foreign key constraint
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS active_version_id UUID;

-- Create index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_templates_active_version_id 
ON templates(active_version_id);

-- Update existing templates to have their first version as active
-- (assuming version_number = 1 for the first version)
UPDATE templates 
SET active_version_id = (
    SELECT tv.id 
    FROM template_versions tv 
    WHERE tv.template_id = templates.id 
    ORDER BY tv.version_number ASC 
    LIMIT 1
)
WHERE active_version_id IS NULL;

-- Now add the foreign key constraint after data is populated
ALTER TABLE templates 
ADD CONSTRAINT fk_templates_active_version_id 
FOREIGN KEY (active_version_id) 
REFERENCES template_versions(id) 
ON DELETE SET NULL;