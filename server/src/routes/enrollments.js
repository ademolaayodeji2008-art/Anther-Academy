import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/enrollments
 * Create enrollment for logged-in student + course
 * Status: "pending_payment" (until payment verified)
 * Protected: Requires JWT authentication
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!course_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'course_id is required',
      });
    }

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price')
      .eq('id', course_id)
      .eq('is_published', true)
      .single();

    if (!course || courseError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course not found or not published',
      });
    }

    // Check if student is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already enrolled in this course',
        existing_enrollment: existingEnrollment,
      });
    }

    // Create enrollment with "pending_payment" status
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id,
          course_id,
          status: 'pending_payment',
          enrolled_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (enrollmentError) {
      console.error('🔴 Database Error - Failed to create enrollment:', {
        message: enrollmentError.message,
        code: enrollmentError.code,
        details: enrollmentError.details,
        supabaseUrl: process.env.SUPABASE_URL?.substring(0, 50) + '...' || 'NOT SET',
      });
      
      const isConnectionError = enrollmentError.message?.includes('fetch failed') || 
                               enrollmentError.message?.includes('ECONNREFUSED') ||
                               enrollmentError.code === 'ETIMEDOUT';
      
      return res.status(500).json({
        error: isConnectionError ? 'Database connection failed' : 'Database error',
        message: isConnectionError 
          ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env'
          : 'Failed to create enrollment',
        code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'DB_ERROR',
      });
    }

    console.log(`✅ Enrollment created: User ${user_id} → Course ${course_id}, Status: pending_payment`);

    res.status(201).json({
      message: 'Enrollment created. Proceed to payment.',
      enrollment,
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
      },
    });
  } catch (error) {
    console.error('🔴 Enrollment creation error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      supabaseUrl: process.env.SUPABASE_URL?.substring(0, 50) + '...' || 'NOT SET',
    });
    
    const isConnectionError = error.message?.includes('fetch failed') || 
                             error.message?.includes('ECONNREFUSED') ||
                             error.code === 'ETIMEDOUT';
    
    res.status(500).json({
      error: isConnectionError ? 'Database connection failed' : 'Server error',
      message: isConnectionError 
        ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env'
        : 'Failed to create enrollment',
      code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/enrollments/user/:userId
 * Get all enrollments for a user
 * Protected: Requires JWT authentication
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to view their own enrollments
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own enrollments',
      });
    }

    const { data: enrollments, error } = await supabase
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
          slug,
          thumbnail_url,
          price
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('🔴 Database Error - Failed to fetch enrollments:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        supabaseUrl: process.env.SUPABASE_URL?.substring(0, 50) + '...' || 'NOT SET',
      });
      
      // Distinguish between connection errors and query errors
      const isConnectionError = error.message?.includes('fetch failed') || 
                               error.message?.includes('ECONNREFUSED') ||
                               error.message?.includes('ENOTFOUND') ||
                               error.code === 'ETIMEDOUT';
      
      return res.status(500).json({
        error: isConnectionError ? 'Database connection failed' : 'Database query failed',
        message: isConnectionError 
          ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env, or verify network connectivity'
          : 'Failed to fetch enrollments from database',
        code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'DB_QUERY_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.code : undefined,
      });
    }

    res.status(200).json({
      enrollments: enrollments || [],
      total: enrollments?.length || 0,
    });
  } catch (error) {
    console.error('🔴 Enrollments fetch error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      supabaseUrl: process.env.SUPABASE_URL?.substring(0, 50) + '...' || 'NOT SET',
    });
    
    // Distinguish between connection errors and other errors
    const isConnectionError = error.message?.includes('fetch failed') || 
                             error.message?.includes('ECONNREFUSED') ||
                             error.message?.includes('ENOTFOUND') ||
                             error.code === 'ETIMEDOUT';
    
    res.status(500).json({
      error: isConnectionError ? 'Database connection failed' : 'Server error',
      message: isConnectionError 
        ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env, or verify network connectivity'
        : 'Failed to fetch enrollments',
      code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/enrollments/status/:enrollmentId
 * Check enrollment status (for payment confirmation)
 * Public endpoint (no auth required) - safe to use on client side
 */
router.get('/status/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('id, user_id, course_id, status, enrolled_at')
      .eq('id', enrollmentId)
      .single();

    if (!enrollment || error) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Enrollment not found',
      });
    }

    res.status(200).json({
      enrollment,
      is_active: enrollment.status === 'active',
    });
  } catch (error) {
    console.error('🔴 Enrollment status error:', {
      message: error.message,
      code: error.code,
      supabaseUrl: process.env.SUPABASE_URL?.substring(0, 50) + '...' || 'NOT SET',
    });
    
    const isConnectionError = error.message?.includes('fetch failed') || 
                             error.message?.includes('ECONNREFUSED') ||
                             error.code === 'ETIMEDOUT';
    
    res.status(500).json({
      error: isConnectionError ? 'Database connection failed' : 'Server error',
      message: isConnectionError 
        ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env'
        : 'Failed to check enrollment status',
      code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'INTERNAL_ERROR',
    });
  }
});

export default router;
