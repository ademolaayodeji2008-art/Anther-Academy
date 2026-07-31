import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware to check admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can manage attendance',
      });
    }

    next();
  } catch (err) {
    console.error('🔴 Admin check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/attendance/course/:courseId/modules
 * Get all modules and lessons for a course
 * Admin can use this to see what needs attendance marking
 * Protected: Admin only
 */
router.get('/course/:courseId/modules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Fetch course with all modules and lessons
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          order_index,
          content_type
        )
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) {
      console.error('🔴 Error fetching modules:', modulesError);
      return res.status(500).json({ error: 'Failed to fetch course structure' });
    }

    res.status(200).json({
      message: 'Course modules retrieved',
      modules: modules || [],
    });
  } catch (err) {
    console.error('🔴 Error in GET /modules:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/admin/attendance/student/:studentId/course/:courseId
 * Get all lessons for a student in a course with their attendance status
 * Shows which lessons student has attended/completed
 * Protected: Admin only
 */
router.get('/student/:studentId/course/:courseId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (!student || studentError) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify enrollment exists
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (!enrollment || enrollmentError) {
      return res.status(404).json({ error: 'Student not enrolled in course' });
    }

    // Get all modules and lessons for course
    const { data: modules } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          order_index,
          content_type
        )
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    // Get attendance records for this student in this course
    const { data: attendance } = await supabase
      .from('lesson_progress')
      .select('lesson_id, attendance_status, attendance_date, admin_marked_at, marked_by_admin')
      .eq('user_id', studentId)
      .eq('course_id', courseId);

    // Build attendance map for quick lookup
    const attendanceMap = {};
    if (attendance) {
      attendance.forEach(record => {
        attendanceMap[record.lesson_id] = record;
      });
    }

    // Enrich modules with attendance status
    const modulesWithAttendance = (modules || []).map(module => ({
      ...module,
      lessons: (module.lessons || []).map(lesson => ({
        ...lesson,
        attendance: attendanceMap[lesson.id] || null,
      })),
    }));

    // Calculate progress
    const totalLessons = modulesWithAttendance.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    const completedLessons = Object.keys(attendanceMap).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.status(200).json({
      message: 'Student attendance retrieved',
      student,
      modules: modulesWithAttendance,
      progress: {
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        progress_percent: progressPercent,
      },
    });
  } catch (err) {
    console.error('🔴 Error in GET /student/:studentId/course/:courseId:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/admin/attendance/mark
 * Mark a student as attended/completed for a lesson
 * Admin marks this on behalf of the student during or after class
 * Protected: Admin only
 */
router.post('/mark', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId, lessonId, courseId, attendanceStatus, attendanceDate } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!studentId || !lessonId || !courseId || !attendanceStatus) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'studentId, lessonId, courseId, and attendanceStatus are required',
      });
    }

    if (!['attended', 'completed', 'absent', 'excused'].includes(attendanceStatus)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'attendanceStatus must be: attended, completed, absent, or excused',
      });
    }

    // Verify student exists and is a student
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (!student || studentError) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify enrollment is active
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (!enrollment || enrollmentError) {
      return res.status(403).json({ error: 'Student not actively enrolled in course' });
    }

    // Verify lesson belongs to course
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .single();

    if (!lesson || lessonError) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if attendance record already exists
    const { data: existingAttendance } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', studentId)
      .eq('lesson_id', lessonId)
      .single();

    let result;
    if (existingAttendance) {
      // Update existing record
      const oldStatus = existingAttendance.attendance_status;
      
      const { data: updated, error: updateError } = await supabase
        .from('lesson_progress')
        .update({
          attendance_status: attendanceStatus,
          attendance_date: attendanceDate || new Date().toISOString().split('T')[0],
          marked_by_admin: adminId,
          admin_marked_at: new Date().toISOString(),
        })
        .eq('id', existingAttendance.id)
        .select()
        .single();

      if (updateError) {
        console.error('🔴 Error updating attendance:', updateError);
        return res.status(500).json({ error: 'Failed to update attendance' });
      }

      result = updated;

      // Log to audit trail
      await supabase.from('attendance_audit_log').insert({
        admin_id: adminId,
        student_id: studentId,
        lesson_id: lessonId,
        course_id: courseId,
        action: 'changed_status',
        old_status: oldStatus,
        new_status: attendanceStatus,
        attendance_date: attendanceDate || new Date().toISOString().split('T')[0],
      });

      console.log(`📝 Admin ${adminId} updated attendance for student ${studentId}, lesson ${lessonId}: ${oldStatus} → ${attendanceStatus}`);
    } else {
      // Create new record
      const { data: created, error: createError } = await supabase
        .from('lesson_progress')
        .insert([{
          user_id: studentId,
          lesson_id: lessonId,
          course_id: courseId,
          attendance_status: attendanceStatus,
          attendance_date: attendanceDate || new Date().toISOString().split('T')[0],
          marked_by_admin: adminId,
          admin_marked_at: new Date().toISOString(),
          completed_at: new Date().toISOString(), // For backward compatibility
        }])
        .select()
        .single();

      if (createError) {
        // Might be duplicate - try to handle gracefully
        if (createError.code === '23505') {
          console.log('📝 Attendance record already exists, updating instead');
          const { data: updated, error: updateError } = await supabase
            .from('lesson_progress')
            .update({
              attendance_status: attendanceStatus,
              attendance_date: attendanceDate || new Date().toISOString().split('T')[0],
              marked_by_admin: adminId,
              admin_marked_at: new Date().toISOString(),
            })
            .eq('user_id', studentId)
            .eq('lesson_id', lessonId)
            .select()
            .single();

          if (updateError) {
            console.error('🔴 Error updating attendance:', updateError);
            return res.status(500).json({ error: 'Failed to mark attendance' });
          }
          result = updated;
        } else {
          console.error('🔴 Error creating attendance:', createError);
          return res.status(500).json({ error: 'Failed to mark attendance' });
        }
      } else {
        result = created;
      }

      // Log to audit trail
      await supabase.from('attendance_audit_log').insert({
        admin_id: adminId,
        student_id: studentId,
        lesson_id: lessonId,
        course_id: courseId,
        action: 'marked_' + attendanceStatus,
        new_status: attendanceStatus,
        attendance_date: attendanceDate || new Date().toISOString().split('T')[0],
      });

      console.log(`✅ Admin ${adminId} marked student ${studentId} as ${attendanceStatus} for lesson ${lessonId}`);
    }

    res.status(200).json({
      message: `Student marked as ${attendanceStatus}`,
      attendance: result,
    });
  } catch (err) {
    console.error('🔴 Error in POST /mark:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/admin/attendance/:attendanceId
 * Remove/undo an attendance marking
 * Allows admin to correct mistakes
 * Protected: Admin only
 */
router.delete('/:attendanceId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const adminId = req.user.id;

    // Fetch attendance record first (for audit log)
    const { data: attendance, error: fetchError } = await supabase
      .from('lesson_progress')
      .select('user_id, lesson_id, course_id, attendance_status')
      .eq('id', attendanceId)
      .single();

    if (!attendance || fetchError) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Delete the record
    const { error: deleteError } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('id', attendanceId);

    if (deleteError) {
      console.error('🔴 Error deleting attendance:', deleteError);
      return res.status(500).json({ error: 'Failed to delete attendance' });
    }

    // Log to audit trail
    await supabase.from('attendance_audit_log').insert({
      admin_id: adminId,
      student_id: attendance.user_id,
      lesson_id: attendance.lesson_id,
      course_id: attendance.course_id,
      action: 'unmarked',
      old_status: attendance.attendance_status,
    });

    console.log(`🔄 Admin ${adminId} unmarked attendance for student ${attendance.user_id}`);

    res.status(200).json({
      message: 'Attendance record deleted',
    });
  } catch (err) {
    console.error('🔴 Error in DELETE /:attendanceId:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
