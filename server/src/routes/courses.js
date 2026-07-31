import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/courses
 * Fetch all published courses with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { level, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        thumbnail_url,
        price,
        duration_weeks,
        level,
        is_published,
        created_at
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Filter by level if provided
    if (level) {
      query = query.eq('level', level);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: courses, error, count } = await query;

    if (error) {
      console.error('🔴 Database Error - Could not connect to Supabase:', {
        message: error.message,
        details: error.details,
        hint: 'Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env file'
      });
      return res.status(500).json({
        error: 'Database connection failed',
        message: 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env',
        code: 'DB_CONNECTION_ERROR'
      });
    }

    res.status(200).json({
      courses: courses || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('🔴 Courses list error:', {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      stack: error.stack
    });
    
    // Distinguish between connection errors and other errors
    const isConnectionError = error.message?.includes('fetch failed') || 
                            error.message?.includes('ECONNREFUSED') ||
                            error.code === 'ENOTFOUND';
    
    res.status(500).json({
      error: isConnectionError ? 'Database connection failed' : 'Server error',
      message: isConnectionError 
        ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env' 
        : 'Failed to fetch courses',
      code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/courses/:courseSlug
 * Fetch single course detail with modules and lessons
 */
router.get('/:courseSlug', async (req, res) => {
  try {
    const { courseSlug } = req.params;

    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', courseSlug)
      .eq('is_published', true)
      .single();

    if (!course || courseError) {
      if (courseError?.code === 'PGRST116') {
        // No rows found
        return res.status(404).json({
          error: 'Not found',
          message: 'Course not found',
        });
      }
      if (courseError) {
        console.error('🔴 Database Error - Could not connect to Supabase:', {
          message: courseError.message,
          details: courseError.details,
          hint: 'Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env file'
        });
        return res.status(500).json({
          error: 'Database connection failed',
          message: 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env',
          code: 'DB_CONNECTION_ERROR'
        });
      }
      return res.status(404).json({
        error: 'Not found',
        message: 'Course not found',
      });
    }

    // Fetch modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });

    if (modulesError) {
      console.error('🔴 Database Error - Failed to fetch modules:', {
        message: modulesError.message,
        hint: 'Check Supabase connection'
      });
    }

    // Fetch lessons for all modules
    let lessonsMap = {};
    if (modules && modules.length > 0) {
      const moduleIds = modules.map(m => m.id);
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('🔴 Database Error - Failed to fetch lessons:', {
          message: lessonsError.message,
          hint: 'Check Supabase connection'
        });
      }

      // Group lessons by module
      if (lessons) {
        lessons.forEach(lesson => {
          if (!lessonsMap[lesson.module_id]) {
            lessonsMap[lesson.module_id] = [];
          }
          lessonsMap[lesson.module_id].push(lesson);
        });
      }
    }

    // Combine modules with their lessons
    const modulesWithLessons = (modules || []).map(module => ({
      ...module,
      lessons: lessonsMap[module.id] || [],
    }));

    res.status(200).json({
      course: {
        ...course,
        modules: modulesWithLessons,
      },
    });
  } catch (error) {
    console.error('🔴 Course detail error:', {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      stack: error.stack
    });
    
    // Distinguish between connection errors and other errors
    const isConnectionError = error.message?.includes('fetch failed') || 
                            error.message?.includes('ECONNREFUSED') ||
                            error.code === 'ENOTFOUND';
    
    res.status(500).json({
      error: isConnectionError ? 'Database connection failed' : 'Server error',
      message: isConnectionError 
        ? 'Could not connect to Supabase — check SUPABASE_URL and SUPABASE_SECRET_KEY in .env' 
        : 'Failed to fetch course details',
      code: isConnectionError ? 'DB_CONNECTION_ERROR' : 'INTERNAL_ERROR'
    });
  }
});

export default router;
