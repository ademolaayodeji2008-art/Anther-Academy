import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only admins can manage courses',
    });
  }
  next();
};

/**
 * GET /api/admin/courses
 * List all courses (admin view)
 * Protected: Admin only
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: courses, count, error } = await supabase
      .from('courses')
      .select('id, title, slug, description, price, level, is_published, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('🔴 Error fetching courses:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch courses',
      });
    }

    res.status(200).json({
      courses: courses || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('🔴 Courses fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch courses',
    });
  }
});

/**
 * POST /api/admin/courses
 * Create a new course
 * Protected: Admin only
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, slug, description, price, duration_weeks, level, thumbnail_url, is_published } = req.body;

    // Validation
    if (!title || !slug || !price) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'title, slug, and price are required',
      });
    }

    // Check if slug is unique
    const { data: existing, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', slug)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Course slug must be unique',
      });
    }

    // Create course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([
        {
          title,
          slug,
          description: description || null,
          price: parseInt(price),
          duration_weeks: parseInt(duration_weeks) || 4,
          level: level || 'new_to_practice',
          thumbnail_url: thumbnail_url || null,
          is_published: is_published || false,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (courseError) {
      console.error('🔴 Error creating course:', courseError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create course',
      });
    }

    console.log(`✅ Course created: ${course.id}`);

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('🔴 Course creation error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create course',
    });
  }
});

/**
 * PUT /api/admin/courses/:courseId
 * Update a course
 * Protected: Admin only
 */
router.put('/:courseId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, price, duration_weeks, level, thumbnail_url, is_published } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseInt(price);
    if (duration_weeks) updateData.duration_weeks = parseInt(duration_weeks);
    if (level) updateData.level = level;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (!course || courseError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course not found',
      });
    }

    console.log(`✅ Course updated: ${courseId}`);

    res.status(200).json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('🔴 Course update error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update course',
    });
  }
});

/**
 * DELETE /api/admin/courses/:courseId
 * Delete a course (and all related data)
 * Protected: Admin only
 */
router.delete('/:courseId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Delete course (cascades to modules, lessons, etc.)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      console.error('🔴 Error deleting course:', deleteError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete course',
      });
    }

    console.log(`✅ Course deleted: ${courseId}`);

    res.status(200).json({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('🔴 Course deletion error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete course',
    });
  }
});

/**
 * POST /api/admin/courses/:courseId/modules
 * Create a module in a course
 * Protected: Admin only
 */
router.post('/:courseId/modules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order_index } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'title is required',
      });
    }

    // Get next order_index
    const { data: lastModules } = await supabase
      .from('modules')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const lastModule = lastModules && lastModules.length > 0 ? lastModules[0] : null;
    const nextOrder = order_index || ((lastModule?.order_index || 0) + 1);

    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .insert([
        {
          course_id: courseId,
          title,
          description: description || null,
          order_index: nextOrder,
        },
      ])
      .select()
      .single();

    if (moduleError) {
      console.error('🔴 Error creating module:', moduleError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create module',
      });
    }

    console.log(`✅ Module created: ${module.id}`);

    res.status(201).json({
      message: 'Module created successfully',
      module,
    });
  } catch (error) {
    console.error('🔴 Module creation error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create module',
    });
  }
});

/**
 * PUT /api/admin/courses/:courseId/modules/:moduleId
 * Update a module
 * Protected: Admin only
 */
router.put('/:courseId/modules/:moduleId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, order_index } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order_index) updateData.order_index = order_index;

    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .update(updateData)
      .eq('id', moduleId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (!module || moduleError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Module not found',
      });
    }

    console.log(`✅ Module updated: ${moduleId}`);

    res.status(200).json({
      message: 'Module updated successfully',
      module,
    });
  } catch (error) {
    console.error('🔴 Module update error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update module',
    });
  }
});

/**
 * DELETE /api/admin/courses/:courseId/modules/:moduleId
 * Delete a module
 * Protected: Admin only
 */
router.delete('/:courseId/modules/:moduleId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const { error: deleteError } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId)
      .eq('course_id', courseId);

    if (deleteError) {
      console.error('🔴 Error deleting module:', deleteError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete module',
      });
    }

    console.log(`✅ Module deleted: ${moduleId}`);

    res.status(200).json({
      message: 'Module deleted successfully',
    });
  } catch (error) {
    console.error('🔴 Module deletion error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete module',
    });
  }
});

/**
 * POST /api/admin/courses/:courseId/modules/:moduleId/lessons
 * Create a lesson in a module
 * Protected: Admin only
 */
router.post('/:courseId/modules/:moduleId/lessons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, content_type, content_url, order_index } = req.body;

    if (!title || !content_type) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'title and content_type are required',
      });
    }

    // Get next order_index
    const { data: lastLessons } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1);

    const lastLesson = lastLessons && lastLessons.length > 0 ? lastLessons[0] : null;
    const nextOrder = order_index || ((lastLesson?.order_index || 0) + 1);

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert([
        {
          module_id: moduleId,
          title,
          description: description || null,
          content_type,
          content_url: content_url || null,
          order_index: nextOrder,
        },
      ])
      .select()
      .single();

    if (lessonError) {
      console.error('🔴 Error creating lesson:', lessonError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create lesson',
      });
    }

    console.log(`✅ Lesson created: ${lesson.id}`);

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (error) {
    console.error('🔴 Lesson creation error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create lesson',
    });
  }
});

/**
 * PUT /api/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId
 * Update a lesson
 * Protected: Admin only
 */
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { title, description, content_type, content_url, order_index } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content_type) updateData.content_type = content_type;
    if (content_url !== undefined) updateData.content_url = content_url;
    if (order_index) updateData.order_index = order_index;

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId)
      .eq('module_id', moduleId)
      .select()
      .single();

    if (!lesson || lessonError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Lesson not found',
      });
    }

    console.log(`✅ Lesson updated: ${lessonId}`);

    res.status(200).json({
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    console.error('🔴 Lesson update error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update lesson',
    });
  }
});

/**
 * DELETE /api/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId
 * Delete a lesson
 * Protected: Admin only
 */
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { lessonId, moduleId } = req.params;

    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('module_id', moduleId);

    if (deleteError) {
      console.error('🔴 Error deleting lesson:', deleteError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete lesson',
      });
    }

    console.log(`✅ Lesson deleted: ${lessonId}`);

    res.status(200).json({
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('🔴 Lesson deletion error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete lesson',
    });
  }
});

export default router;
