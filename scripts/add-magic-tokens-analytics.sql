-- Migration: Add analytics columns to magic_tokens table
-- This will preserve all existing tokens for analytics purposes

-- Add analytics columns to magic_tokens
ALTER TABLE magic_tokens 
ADD COLUMN IF NOT EXISTS used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS used_at timestamp with time zone DEFAULT NULL;

-- Update existing records to have proper created_at and used status
UPDATE magic_tokens 
SET created_at = NOW()
WHERE created_at IS NULL;

-- Create index for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_magic_tokens_used ON magic_tokens(used);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_created_at ON magic_tokens(created_at);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_user_id_created ON magic_tokens(user_id, created_at);

-- Create view for analytics
CREATE OR REPLACE VIEW magic_tokens_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as tokens_generated,
    COUNT(CASE WHEN used = true THEN 1 END) as tokens_used,
    COUNT(CASE WHEN used = false AND expires_at < NOW() THEN 1 END) as tokens_expired,
    ROUND(COUNT(CASE WHEN used = true THEN 1 END)::decimal / COUNT(*) * 100, 2) as usage_rate_percent
FROM magic_tokens
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

COMMENT ON VIEW magic_tokens_analytics IS 'Daily analytics for magic token generation and usage';