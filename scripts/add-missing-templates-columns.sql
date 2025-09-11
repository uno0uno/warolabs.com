-- Add missing columns to templates table
-- These columns are referenced in the API but don't exist in the current schema

-- Add name column (required for template identification)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Template';

-- Add description column (optional but referenced in API)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add template_type column (with default for email campaigns)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) NOT NULL DEFAULT 'massive_email';

-- Add subject_template column (for email subject)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS subject_template TEXT;

-- Add sender_email column (for email campaigns)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS sender_email VARCHAR(255);

-- Add created_at timestamp if it doesn't exist
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at);