-- Migration: 017_migrate_to_admin_attendance.sql
-- Description: Convert from self-paced progress to admin-controlled session attendance
-- This is a physical/hybrid class system, NOT self-paced online videos

-- Create session attendance table (replaces self-marked lesson progress)
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  -- module_id represents a class session/date, not a multi-lesson module
  
  status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
  marked_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  -- marked_by: must be admin/instructor, cannot be deleted
  
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  -- notes: e.g. "arrived late", "left early", "makeup session"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, course_id, module_id)
  -- One attendance record per student per session
);

-- Indexes for fast lookups
CREATE INDEX idx_session_attendance_user_id ON session_attendance(user_id);
CREATE INDEX idx_session_attendance_course_id ON session_attendance(course_id);
CREATE INDEX idx_session_attendance_module_id ON session_attendance(module_id);
CREATE INDEX idx_session_attendance_marked_by ON session_attendance(marked_by);
CREATE INDEX idx_session_attendance_status ON session_attendance(status);
CREATE INDEX idx_session_attendance_created_at ON session_attendance(created_at DESC);
CREATE INDEX idx_session_attendance_user_course ON session_attendance(user_id, course_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_session_attendance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_session_attendance_timestamp ON session_attendance;
CREATE TRIGGER trigger_session_attendance_timestamp
BEFORE UPDATE ON session_attendance
FOR EACH ROW
EXECUTE FUNCTION update_session_attendance_timestamp();

-- Attendance audit log for compliance
CREATE TABLE IF NOT EXISTS attendance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_attendance_id UUID NOT NULL REFERENCES session_attendance(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted'
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attendance_audit_session_id ON attendance_audit_log(session_attendance_id);
CREATE INDEX idx_attendance_audit_admin_id ON attendance_audit_log(admin_id);
CREATE INDEX idx_attendance_audit_created_at ON attendance_audit_log(created_at DESC);

-- Disable self-marked progress for students
-- lesson_progress table now ONLY for admin-marked completions
-- Add columns to track admin marking
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS marked_by_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS admin_marked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS marked_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Migration note: old lesson_progress records will have marked_by_admin=FALSE (student self-marked)
-- These should be ignored in progress calculations
-- Only count records where marked_by_admin=TRUE

COMMENT ON TABLE session_attendance IS 'Admin-controlled attendance for physical/hybrid class sessions. Students do NOT self-mark.';
COMMENT ON COLUMN session_attendance.module_id IS 'References a module but represents a single class session/date';
COMMENT ON COLUMN session_attendance.status IS 'present = attended, absent = did not attend, excused = excused absence';
COMMENT ON COLUMN session_attendance.marked_by IS 'Admin or instructor who marked attendance';
COMMENT ON COLUMN lesson_progress.marked_by_admin IS 'TRUE = admin-marked (counts towards progress), FALSE = old student self-marked (ignore)';
COMMENT ON TABLE attendance_audit_log IS 'Compliance audit trail of all attendance changes';
