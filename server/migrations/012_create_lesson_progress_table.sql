-- Migration: 012_create_lesson_progress_table.sql
-- Description: Track lesson completion progress for students

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: user can only complete a lesson once (no duplicates)
  UNIQUE(user_id, lesson_id),
  
  -- Indexes for fast queries
  CONSTRAINT check_completion_time CHECK (completed_at <= NOW())
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lesson_progress_timestamp ON lesson_progress;
CREATE TRIGGER trigger_lesson_progress_timestamp
BEFORE UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_lesson_progress_timestamp();

-- Comment for documentation
COMMENT ON TABLE lesson_progress IS 'Tracks which lessons each student has completed. Used for progress bars and quiz unlock logic.';
COMMENT ON COLUMN lesson_progress.completed_at IS 'Timestamp when lesson was marked complete by student';
COMMENT ON COLUMN lesson_progress.user_id IS 'Student who completed the lesson';
COMMENT ON COLUMN lesson_progress.course_id IS 'Course the lesson belongs to (denormalized for query efficiency)';
