import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only admins can access this resource',
    });
  }
  next();
};

/**
 * GET /api/admin/overview
 * Dashboard overview statistics
 * Protected: Admin only
 */
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching admin overview...');
    
    // Set a timeout of 10 seconds for the entire request
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Admin overview request timed out after 10 seconds')), 10000)
    );

    const overviewPromise = (async () => {
      // Total students (users with role 'student')
      const { count: totalStudents, error: studentsError } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'student');

      if (studentsError) {
        console.error('🔴 Error counting students:', studentsError);
      }

      // Total active enrollments
      const { count: activeEnrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('🔴 Error counting active enrollments:', enrollmentsError);
      }

      // Total completed enrollments
      const { count: completedEnrollments, error: completedError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact' })
        .eq('status', 'completed');

      if (completedError) {
        console.error('🔴 Error counting completed enrollments:', completedError);
      }

      // Calculate completion rate
      const totalEnrollments = (activeEnrollments || 0) + (completedEnrollments || 0);
      const completionRate = totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

      // Total successful payments (sum of successful payments)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'success');

      if (paymentsError) {
        console.error('🔴 Error fetching successful payments:', paymentsError);
      }

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Pending payments
      const { count: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      if (pendingError) {
        console.error('🔴 Error counting pending payments:', pendingError);
      }

      // Total courses
      const { count: totalCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact' });

      if (coursesError) {
        console.error('🔴 Error counting courses:', coursesError);
      }

      // Total certificates issued
      const { count: totalCertificates, error: certsError } = await supabase
        .from('certificates')
        .select('*', { count: 'exact' });

      if (certsError) {
        console.error('🔴 Error counting certificates:', certsError);
      }

      console.log('✅ Admin overview data fetched successfully');

      return {
        total_students: totalStudents || 0,
        active_enrollments: activeEnrollments || 0,
        completed_enrollments: completedEnrollments || 0,
        completion_rate: completionRate,
        total_revenue: totalRevenue,
        pending_payments: pendingPayments || 0,
        total_courses: totalCourses || 0,
        total_certificates: totalCertificates || 0,
      };
    })();

    // Race between timeout and overview fetch
    const overview = await Promise.race([overviewPromise, timeoutPromise]);

    res.status(200).json({
      overview,
    });
  } catch (error) {
    console.error('🔴 Admin overview error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    
    // Distinguish between timeout and other errors
    const isTimeout = error.message?.includes('timed out');
    const statusCode = isTimeout ? 504 : 500;
    
    res.status(statusCode).json({
      error: isTimeout ? 'Request timeout' : 'Server error',
      message: isTimeout 
        ? 'Admin overview request took too long. Please check database connectivity and try again.'
        : 'Failed to fetch overview',
      code: isTimeout ? 'REQUEST_TIMEOUT' : 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/admin/students
 * List all students with filters
 * Protected: Admin only
 */
router.get('/students', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '' } = req.query;

    let query = supabase
      .from('users')
      .select('id, full_name, email, role, created_at', { count: 'exact' })
      .eq('role', 'student')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: students, count, error } = await query;

    if (error) {
      console.error('🔴 Error fetching students:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch students',
      });
    }

    res.status(200).json({
      students: students || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('🔴 Students fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch students',
    });
  }
});

/**
 * GET /api/admin/students/:studentId/details
 * Get detailed student info with enrollments and progress
 * Protected: Admin only
 */
router.get('/students/:studentId/details', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch student
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (!student || studentError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Student not found',
      });
    }

    // Fetch enrollments with course details
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          slug
        )
      `)
      .eq('user_id', studentId)
      .order('enrolled_at', { ascending: false });

    if (enrollmentsError) {
      console.error('🔴 Error fetching enrollments:', enrollmentsError);
    }

    // Fetch progress for each course
    const progressData = {};
    for (const enrollment of enrollments || []) {
      try {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('id', { count: 'exact' })
          .eq('user_id', studentId)
          .eq('course_id', enrollment.course_id);

        const { count: totalLessons } = await supabase
          .from('lessons')
          .select('id', { count: 'exact' })
          .eq('module_id', enrollment.course_id);

        progressData[enrollment.course_id] = {
          completed_lessons: progress || 0,
          total_lessons: totalLessons || 0,
        };
      } catch (err) {
        console.error(`Error fetching progress for course ${enrollment.course_id}:`, err);
      }
    }

    console.log(`✅ Student details fetched: ${studentId}`);

    res.status(200).json({
      student,
      enrollments: enrollments || [],
      progress: progressData,
    });
  } catch (error) {
    console.error('🔴 Student details error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch student details',
    });
  }
});

/**
 * GET /api/admin/payments
 * List all payments with filters
 * Protected: Admin only
 */
router.get('/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = '', student_id = '' } = req.query;

    let query = supabase
      .from('payments')
      .select(`
        id,
        enrollment_id,
        amount,
        status,
        reference,
        created_at,
        enrollments (
          id,
          user_id,
          users (
            full_name,
            email
          ),
          courses (
            title
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (student_id) {
      query = query.eq('enrollments.user_id', student_id);
    }

    const { data: payments, count, error } = await query;

    if (error) {
      console.error('🔴 Error fetching payments:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch payments',
      });
    }

    res.status(200).json({
      payments: payments || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('🔴 Payments fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch payments',
    });
  }
});

/**
 * PUT /api/admin/payments/:paymentId/verify
 * Manually verify payment in edge cases
 * Protected: Admin only
 */
router.put('/payments/:paymentId/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { notes } = req.body;

    // Fetch payment
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, enrollment_id, status')
      .eq('id', paymentId)
      .single();

    if (!payment || fetchError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Payment not found',
      });
    }

    if (payment.status === 'success') {
      return res.status(400).json({
        error: 'Already verified',
        message: 'This payment is already verified',
      });
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      console.error('🔴 Error updating payment:', updateError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to verify payment',
      });
    }

    // Update enrollment status
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.enrollment_id);

    if (enrollmentError) {
      console.error('🔴 Error updating enrollment:', enrollmentError);
    }

    console.log(`✅ Payment verified manually: ${paymentId}`);

    res.status(200).json({
      message: 'Payment verified successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('🔴 Payment verification error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify payment',
    });
  }
});

/**
 * GET /api/admin/enrollments
 * List all enrollments with filters
 * Protected: Admin only
 */
router.get('/enrollments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = '', course_id = '' } = req.query;

    let query = supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        users (
          full_name,
          email
        ),
        courses (
          title
        )
      `)
      .order('enrolled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (course_id) {
      query = query.eq('course_id', course_id);
    }

    const { data: enrollments, count, error } = await query;

    if (error) {
      console.error('🔴 Error fetching enrollments:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch enrollments',
      });
    }

    res.status(200).json({
      enrollments: enrollments || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('🔴 Enrollments fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch enrollments',
    });
  }
});

export default router;
