-- Migration: Add email_sends table and update email tracking structure
-- This creates a proper hierarchy: email_sends -> email_opens/email_clicks

-- Create email_sends table (base tracking table)
CREATE TABLE IF NOT EXISTS public.email_sends (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    campaign_id uuid NOT NULL,
    lead_id uuid NOT NULL,
    email varchar(255) NOT NULL,
    subject text,
    sent_at timestamp with time zone DEFAULT NOW(),
    status varchar(50) DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
    error_message text,
    message_id varchar(255), -- AWS SES Message ID
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.email_sends
ADD CONSTRAINT fk_email_sends_campaign 
    FOREIGN KEY (campaign_id) REFERENCES public.campaign(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_email_sends_lead 
    FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign_id ON public.email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_lead_id ON public.email_sends(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_email ON public.email_sends(email);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON public.email_sends(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON public.email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_message_id ON public.email_sends(message_id);

-- Add email_send_id column to email_opens
ALTER TABLE public.email_opens 
ADD COLUMN IF NOT EXISTS email_send_id uuid;

-- Add email_send_id column to email_clicks
ALTER TABLE public.email_clicks 
ADD COLUMN IF NOT EXISTS email_send_id uuid;

-- Add foreign key constraints to existing tables
ALTER TABLE public.email_opens
ADD CONSTRAINT fk_email_opens_send 
    FOREIGN KEY (email_send_id) REFERENCES public.email_sends(id) ON DELETE CASCADE;

ALTER TABLE public.email_clicks
ADD CONSTRAINT fk_email_clicks_send 
    FOREIGN KEY (email_send_id) REFERENCES public.email_sends(id) ON DELETE CASCADE;

-- Create indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_email_opens_send_id ON public.email_opens(email_send_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_send_id ON public.email_clicks(email_send_id);

-- Add comments for documentation
COMMENT ON TABLE public.email_sends IS 'Base table for email send tracking - one record per email sent';
COMMENT ON COLUMN public.email_sends.status IS 'Email delivery status: sent, failed, bounced';
COMMENT ON COLUMN public.email_sends.message_id IS 'External service message ID (e.g., AWS SES)';
COMMENT ON COLUMN public.email_opens.email_send_id IS 'References the specific email send that was opened';
COMMENT ON COLUMN public.email_clicks.email_send_id IS 'References the specific email send that was clicked';