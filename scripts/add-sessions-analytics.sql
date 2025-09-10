-- Migration: Add analytics and traceability columns to sessions table
-- This will preserve all session data for security and analytics purposes

-- Add analytics columns to sessions
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS login_method varchar(50) DEFAULT 'magic_link',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS ended_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS end_reason varchar(50) DEFAULT NULL; -- 'logout', 'expired', 'forced'

-- Update existing records to have proper timestamps
UPDATE sessions 
SET created_at = NOW(), last_activity_at = NOW()
WHERE created_at IS NULL;

-- Create indexes for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);

-- Create view for session analytics
CREATE OR REPLACE VIEW sessions_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as sessions_created,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions,
    COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as ended_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips,
    AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - created_at))/3600) as avg_session_duration_hours,
    COUNT(CASE WHEN end_reason = 'logout' THEN 1 END) as manual_logouts,
    COUNT(CASE WHEN end_reason = 'expired' THEN 1 END) as expired_sessions
FROM sessions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create view for current active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.id,
    s.user_id,
    p.email,
    p.name,
    s.created_at,
    s.last_activity_at,
    s.expires_at,
    s.ip_address,
    s.user_agent,
    s.login_method,
    EXTRACT(EPOCH FROM (NOW() - s.last_activity_at))/60 as minutes_since_last_activity
FROM sessions s
JOIN profile p ON s.user_id = p.id
WHERE s.is_active = true 
  AND s.expires_at > NOW()
ORDER BY s.last_activity_at DESC;

COMMENT ON VIEW sessions_analytics IS 'Daily analytics for user sessions and activity';
COMMENT ON VIEW active_sessions IS 'Currently active user sessions with user details';

-- Add comments to new columns for documentation
COMMENT ON COLUMN sessions.created_at IS 'When the session was created';
COMMENT ON COLUMN sessions.last_activity_at IS 'Last time the session was used';
COMMENT ON COLUMN sessions.ip_address IS 'IP address where session was created';
COMMENT ON COLUMN sessions.user_agent IS 'User agent string from login';
COMMENT ON COLUMN sessions.login_method IS 'How user logged in (magic_link, etc)';
COMMENT ON COLUMN sessions.is_active IS 'Whether session is currently active';
COMMENT ON COLUMN sessions.ended_at IS 'When session was ended';
COMMENT ON COLUMN sessions.end_reason IS 'Why session ended (logout, expired, forced)';