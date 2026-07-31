-- Migration: 018_fix_motivation_constraints.sql
-- Description: Fix motivation field constraints - convert from character length to word count validation
-- Problem: Migration 015 used LENGTH() to enforce 150-200 CHARS, but frontend counts WORDS (150-200)
--          A genuine 150-200 word answer = 800-1200+ characters, causing rejections
-- Solution: Remove character-based CHECK constraints, add word-count validation in backend API

-- Drop the incorrect character-based CHECK constraints
ALTER TABLE programme_applications 
DROP CONSTRAINT IF EXISTS "programme_applications_motivation_why_enrol_check",
DROP CONSTRAINT IF EXISTS "programme_applications_motivation_learning_experience_check";

-- Leave motivation fields as plain TEXT (no DB-level constraints)
-- Word count validation (150-200 words) will be enforced in backend POST /api/applications route

-- Document: Backend validation now enforces:
-- - motivation_why_enrol: MUST be 150-200 words (splitting on whitespace)
-- - motivation_learning_experience: MUST be 150-200 words (splitting on whitespace)
-- - If outside range: return 400 Bad Request with clear error message
-- - If NULL: skip validation (optional field)

COMMENT ON COLUMN programme_applications.motivation_why_enrol IS 'Why applicant wants to enroll (150-200 words required). Validated in backend API.';
COMMENT ON COLUMN programme_applications.motivation_learning_experience IS 'What applicant wants to learn/experience (150-200 words required). Validated in backend API.';

-- Verify columns are now plain TEXT with no length constraints
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'programme_applications' AND column_name IN ('motivation_why_enrol', 'motivation_learning_experience');
