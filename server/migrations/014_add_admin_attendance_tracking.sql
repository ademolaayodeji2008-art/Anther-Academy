-- Migration: 014_add_admin_attendance_tracking.sql
-- Description: Convert lesson_progress from student-self-reported to admin-controlled attendance tracking
-- For physical/in-person classes where admin/instructors mark attendance and completion

-- Add admin tracking columns to lesson_progress
ALTER TABLE lesson_progress
ADD COLUMN IF NOT EXISTS marked_by_admin UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS admin_marked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS attendance_date DATE,
ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(20) CHECK (attendance_status IN ('attended', 'completed', 'absent', 'excused')) DEFAULT 'attended';

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_lesson_progress_marked_by_admin ON lesson_progress(marked_by_admin);

-- Add comment for clarity
COMMENT ON COLUMN lesson_progress.marked_by_admin IS 'Admin/instructor who marked this attendance (NULL means student-initiated old data)';
COMMENT ON COLUMN lesson_progress.admin_marked_at IS 'When admin marked this attendance';
COMMENT ON COLUMN lesson_progress.attendance_date IS 'The date the student attended the class';
COMMENT ON COLUMN lesson_progress.attendance_status IS 'attended, completed, absent, or excused - tracked by admin';

-- Create audit log table for admin changes
CREATE TABLE IF NOT EXISTS attendance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('marked_attended', 'marked_completed', 'unmarked', 'changed_status')),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  attendance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for auditing
  CONSTRAINT fk_admin_id FOREIGN KEY (admin_id) REFERENCES users(id),
  CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_audit_admin ON attendance_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_student ON attendance_audit_log(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_course ON attendance_audit_log(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_created ON attendance_audit_log(created_at DESC);

COMMENT ON TABLE attendance_audit_log IS 'Audit trail of all admin attendance marking changes for compliance and accountability';
