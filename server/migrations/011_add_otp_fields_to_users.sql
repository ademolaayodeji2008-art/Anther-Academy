-- Migration: 011_add_otp_fields_to_users.sql
-- Description: Add OTP verification fields to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for OTP lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_code ON users(email_verification_code);
