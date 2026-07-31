import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/progress
 * DEPRECATED: Students cannot self-mark progress anymore
 * Progress is now admin-controlled via session attendance
 * This endpoint is disabled to prevent unauthorized progress updates
 */
router.post('/', authenticateToken, async (req, res) => {
  return res.status(403).json({
    error: 'Forbidden',
    message: 'Students cannot self-mark lesson progress. Progress is now tracked via admin-controlled session attendance. Contact your instructor if you believe there is an error.',
  });
});

/**
 * GET /api/progress/:courseId
 * Get progress for a course based on admin-marked session attendance
 * NOT student self-reported progress
 * Protected: Requires JWT authentication
 * 
 * FIXED: Returns 0% (or "No sessions scheduled yet") if course has 0 modules/sessions, never NaN
 */
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.id;

    // Verify enrollment exists
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', courseId)
      .single();

    if (!enrollment || enrollmentError) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not enrolled in this course',
      });
    }

    // Get all modules (sessions) for course
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, course_id, order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) {
      console.error('🔴 Error fetching modules:', modulesError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch course modules',
      });
    }

    const totalModules = modules?.length || 0;

    // FIX: If no sessions scheduled, return 0% with clear message
    if (totalModules === 0) {
      return res.status(200).json({
        course_id: courseId,
        modules: [],
        stats: {
          total_sessions: 0,
          attended_sessions: 0,
          progress_percentage: 0,
          message: 'No sessions scheduled yet',
        },
      });
    }

    // Get admin-marked attendance for this user in this course
    const { data: attendance, error: attendanceError } = await supabase
      .from('session_attendance')
      .select('id, module_id, status')
      .eq('user_id', user_id)
      .eq('course_id', courseId)
      .in('status', ['present', 'excused']); // Count both as attended

    if (attendanceError) {
      console.error('🔴 Error fetching attendance:', attendanceError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch progress',
      });
    }

    const attendedSessions = attendance?.length || 0;
    const progressPercentage = totalModules > 0 ? (attendedSessions / totalModules) * 100 : 0;

    // Build detailed session list
    const attendanceMap = new Map();
    attendance?.forEach(record => {
      attendanceMap.set(record.module_id, record.status);
    });

    const sessionsWithAttendance = modules.map(module => ({
      id: module.id,
      title: module.title,
      order_index: module.order_index,
      attendance_status: attendanceMap.get(module.id) || null, // null = not yet marked
    }));

    console.log(
      `📊 Progress fetched: User ${user_id} → Course ${courseId} (${attendedSessions}/${totalModules} sessions)`
    );

    res.status(200).json({
      course_id: courseId,
      modules: sessionsWithAttendance,
      stats: {
        total_sessions: totalModules,
        attended_sessions: attendedSessions,
        progress_percentage: Math.round(progressPercentage),
      },
    });
  } catch (error) {
    console.error('🔴 Progress fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch progress',
    });
  }
});

/**
 * GET /api/progress/course/:courseId/status
 * Check if course is complete based on admin-marked attendance
 * NOT self-reported progress
 * Protected: Requires JWT authentication
 * 
 * FIXED: Returns clear message if no sessions yet, never NaN
 */
router.get('/course/:courseId/status', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.id;

    // Get total sessions (modules) in course
    const { data: allModules, error: modulesError } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId);

    if (modulesError) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check course status',
      });
    }

    const totalSessions = allModules?.length || 0;

    // FIX: If no sessions scheduled, return 0% with clear message
    if (totalSessions === 0) {
      return res.status(200).json({
        course_id: courseId,
        total_sessions: 0,
        attended_sessions: 0,
        is_complete: false,
        quiz_unlocked: false,
        message: 'No sessions scheduled yet. Check back later.',
      });
    }

    // Count admin-marked attendance (present or excused) for this user
    const { count: attendedCount, error: countError } = await supabase
      .from('session_attendance')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('course_id', courseId)
      .in('status', ['present', 'excused']);

    if (countError) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check course status',
      });
    }

    const attendedSessions = attendedCount || 0;
    const isCourseComplete = attendedSessions === totalSessions && totalSessions > 0;

    console.log(
      `📚 Course status: User ${user_id} → Course ${courseId} (${attendedSessions}/${totalSessions}) ${isCourseComplete ? '✅ COMPLETE' : ''}`
    );

    res.status(200).json({
      course_id: courseId,
      total_sessions: totalSessions,
      attended_sessions: attendedSessions,
      is_complete: isCourseComplete,
      quiz_unlocked: isCourseComplete,
    });
  } catch (error) {
    console.error('🔴 Course status error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to check course status',
    });
  }
});

export default router;
