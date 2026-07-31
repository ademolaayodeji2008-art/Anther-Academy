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
      message: 'Only admins can manage quizzes',
    });
  }
  next();
};

/**
 * POST /api/admin/quizzes
 * Create a new quiz for a module
 * Protected: Admin only
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { module_id, title, description, pass_mark } = req.body;

    // Validation
    if (!module_id || !title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'module_id and title are required',
      });
    }

    if (pass_mark !== undefined && (pass_mark < 0 || pass_mark > 100)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'pass_mark must be between 0 and 100',
      });
    }

    // Verify module exists
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', module_id)
      .single();

    if (!module || moduleError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Module not found',
      });
    }

    // Check if quiz already exists for module
    const { data: existingQuiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('module_id', module_id)
      .single();

    if (existingQuiz) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Quiz already exists for this module',
      });
    }

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          module_id,
          title,
          description: description || null,
          pass_mark: pass_mark || 70,
          is_required: true,
        },
      ])
      .select()
      .single();

    if (quizError) {
      console.error('🔴 Error creating quiz:', quizError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create quiz',
      });
    }

    console.log(`✅ Quiz created: ${quiz.id} for Module ${module_id}`);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    console.error('🔴 Quiz creation error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create quiz',
    });
  }
});

/**
 * PUT /api/admin/quizzes/:quizId
 * Update quiz details (title, description, pass_mark)
 * Protected: Admin only
 */
router.put('/:quizId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, pass_mark } = req.body;

    // Validation
    if (!title && !description && pass_mark === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one field to update is required',
      });
    }

    if (pass_mark !== undefined && (pass_mark < 0 || pass_mark > 100)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'pass_mark must be between 0 and 100',
      });
    }

    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pass_mark !== undefined) updateData.pass_mark = pass_mark;

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', quizId)
      .select()
      .single();

    if (!quiz || quizError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found',
      });
    }

    console.log(`✅ Quiz updated: ${quizId}`);

    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    console.error('🔴 Quiz update error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update quiz',
    });
  }
});

/**
 * POST /api/admin/quizzes/:quizId/questions
 * Add a question to a quiz
 * Protected: Admin only
 */
router.post('/:quizId/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

    // Validation
    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'question_text, all options, and correct_option are required',
      });
    }

    if (!['A', 'B', 'C', 'D'].includes(correct_option.toUpperCase())) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'correct_option must be A, B, C, or D',
      });
    }

    // Verify quiz exists
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', quizId)
      .single();

    if (!quiz || quizError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found',
      });
    }

    // Get next order_index
    const { data: lastQuestion } = await supabase
      .from('quiz_questions')
      .select('order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastQuestion?.order_index || 0) + 1;

    // Create question
    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .insert([
        {
          quiz_id: quizId,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option: correct_option.toUpperCase(),
          explanation: explanation || null,
          order_index: nextOrder,
        },
      ])
      .select()
      .single();

    if (questionError) {
      console.error('🔴 Error creating question:', questionError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create question',
      });
    }

    console.log(`✅ Question added: ${question.id} to Quiz ${quizId}`);

    res.status(201).json({
      message: 'Question added successfully',
      question,
    });
  } catch (error) {
    console.error('🔴 Question creation error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create question',
    });
  }
});

/**
 * PUT /api/admin/quizzes/:quizId/questions/:questionId
 * Update a quiz question
 * Protected: Admin only
 */
router.put('/:quizId/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

    // Validation
    if (correct_option && !['A', 'B', 'C', 'D'].includes(correct_option.toUpperCase())) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'correct_option must be A, B, C, or D',
      });
    }

    // Build update object
    const updateData = {};
    if (question_text) updateData.question_text = question_text;
    if (option_a) updateData.option_a = option_a;
    if (option_b) updateData.option_b = option_b;
    if (option_c) updateData.option_c = option_c;
    if (option_d) updateData.option_d = option_d;
    if (correct_option) updateData.correct_option = correct_option.toUpperCase();
    if (explanation !== undefined) updateData.explanation = explanation;

    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .update(updateData)
      .eq('id', questionId)
      .eq('quiz_id', quizId)
      .select()
      .single();

    if (!question || questionError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Question not found',
      });
    }

    console.log(`✅ Question updated: ${questionId}`);

    res.status(200).json({
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    console.error('🔴 Question update error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update question',
    });
  }
});

/**
 * DELETE /api/admin/quizzes/:quizId/questions/:questionId
 * Delete a quiz question
 * Protected: Admin only
 */
router.delete('/:quizId/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    // Delete question
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId)
      .eq('quiz_id', quizId);

    if (deleteError) {
      console.error('🔴 Error deleting question:', deleteError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete question',
      });
    }

    console.log(`✅ Question deleted: ${questionId}`);

    res.status(200).json({
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('🔴 Question deletion error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete question',
    });
  }
});

/**
 * DELETE /api/admin/quizzes/:quizId
 * Delete entire quiz (and all its questions)
 * Protected: Admin only
 */
router.delete('/:quizId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;

    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (deleteError) {
      console.error('🔴 Error deleting quiz:', deleteError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete quiz',
      });
    }

    console.log(`✅ Quiz deleted: ${quizId}`);

    res.status(200).json({
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('🔴 Quiz deletion error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete quiz',
    });
  }
});

/**
 * GET /api/admin/quizzes/:quizId/questions
 * Get all questions for a quiz (WITH correct answers - admin only)
 * Protected: Admin only
 */
router.get('/:quizId/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;

    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('🔴 Error fetching questions:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch questions',
      });
    }

    res.status(200).json({
      questions: questions || [],
      total: questions?.length || 0,
    });
  } catch (error) {
    console.error('🔴 Questions fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch questions',
    });
  }
});

export default router;
