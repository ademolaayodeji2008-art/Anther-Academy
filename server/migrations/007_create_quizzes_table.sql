-- Migration: 007_create_quizzes_table.sql
-- Description: Create quizzes table for module assessments

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pass_mark INTEGER NOT NULL DEFAULT 70 CHECK (pass_mark >= 0 AND pass_mark <= 100),
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON quizzes(module_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_quizzes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quizzes_updated_at_trigger
BEFORE UPDATE ON quizzes
FOR EACH ROW
EXECUTE FUNCTION update_quizzes_updated_at();
