-- Migration: 002_create_courses_table.sql
-- Description: Create courses table for academy courses

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  level VARCHAR(50) NOT NULL DEFAULT 'new_to_practice' CHECK (
    level IN ('new_to_practice', 'practicing_accountant', 'chartered_advanced')
  ),
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at_trigger
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_courses_updated_at();
