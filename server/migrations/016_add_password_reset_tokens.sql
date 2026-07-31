-- Migration: 016_add_password_reset_tokens.sql
-- Description: Add password reset/set token system for admitted applicants

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Comments
COMMENT ON TABLE password_reset_tokens IS 'One-time tokens for setting/resetting passwords. Used for admitted applicants to set password on first login.';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA256 hash of the actual token (token itself never stored for security)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expires after 24 hours (86400 seconds)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used to set password (prevents reuse)';

-- Add admitted_at timestamp to programme_applications for tracking
ALTER TABLE programme_applications ADD COLUMN IF NOT EXISTS admitted_at TIMESTAMP WITH TIME ZONE;

-- Add payment_completed_at to enrollments for tracking payment status
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN programme_applications.admitted_at IS 'Timestamp when applicant was marked as admitted (auto-set by admission logic)';
COMMENT ON COLUMN enrollments.payment_completed_at IS 'Timestamp when payment was completed (auto-set by payment verification)';
