import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateCertificatePDF, generateVerificationCode } from '../utils/certificateGenerator.js';
import { uploadCertificatePDF } from '../utils/cloudinaryUpload.js';

const router = express.Router();

/**
 * GET /api/quizzes/:quizId
 * Fetch quiz questions for a quiz (don't send correct_option to frontend)
 * Protected: Requires JWT authentication
 */
router.get('/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, description, pass_mark, module_id')
      .eq('id', quizId)
      .single();

    if (!quiz || quizError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found',
      });
    }

    // Fetch questions WITHOUT correct_option (security)
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      console.error('🔴 Error fetching quiz questions:', questionsError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch quiz questions',
      });
    }

    console.log(`📝 Quiz fetched: ${quizId} (${questions?.length || 0} questions)`);

    res.status(200).json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        pass_mark: quiz.pass_mark,
        module_id: quiz.module_id,
        total_questions: questions?.length || 0,
      },
      questions: questions || [],
    });
  } catch (error) {
    console.error('🔴 Quiz fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch quiz',
    });
  }
});

/**
 * POST /api/quizzes/:quizId/submit
 * Submit quiz answers, grade server-side, record attempt with score
 * Protected: Requires JWT authentication
 */
router.post('/:quizId/submit', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // answers = { question_id: 'A', question_id: 'B', ... }
    const user_id = req.user.id;

    // Validation
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'answers object is required',
      });
    }

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, pass_mark, module_id')
      .eq('id', quizId)
      .single();

    if (!quiz || quizError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found',
      });
    }

    // Fetch all questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, correct_option')
      .eq('quiz_id', quizId);

    if (questionsError) {
      console.error('🔴 Error fetching questions for grading:', questionsError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to grade quiz',
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        error: 'Invalid quiz',
        message: 'Quiz has no questions',
      });
    }

    // Grade the quiz server-side
    let correctCount = 0;
    const detailedAnswers = {};

    questions.forEach(q => {
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correct_option;
      
      if (isCorrect) correctCount++;
      
      detailedAnswers[q.id] = {
        student_answer: studentAnswer || null,
        correct_answer: q.correct_option,
        is_correct: isCorrect,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.pass_mark;

    // Record quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          user_id,
          quiz_id: quizId,
          score,
          passed,
          answers: detailedAnswers,
          attempted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (attemptError) {
      console.error('🔴 Error recording quiz attempt:', attemptError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to record quiz attempt',
      });
    }

    console.log(`✅ Quiz submitted: User ${user_id} → Quiz ${quizId}, Score: ${score}%, Passed: ${passed}`);

    res.status(200).json({
      message: 'Quiz submitted successfully',
      result: {
        attempt_id: attempt.id,
        score,
        passed,
        pass_mark: quiz.pass_mark,
        correct_count: correctCount,
        total_questions: questions.length,
      },
    });

    // ===== AUTO-GENERATE CERTIFICATE IF PASSED =====
    if (passed) {
      try {
        // Check if certificate already exists
        const { data: existingCert } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', user_id)
          .eq('course_id', enrollment.course_id)
          .single();

        if (!existingCert) {
          // Fetch user and course data for certificate
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', user_id)
            .single();

          const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('title')
            .eq('id', enrollment.course_id)
            .single();

          if (user && course) {
            // Generate verification code
            const verification_code = generateVerificationCode();

            // Generate PDF
            const pdfBuffer = await generateCertificatePDF({
              full_name: user.full_name,
              course_title: course.title,
              completion_date: new Date().toISOString(),
              verification_code,
            });

            // Upload to Cloudinary
            const certificate_url = await uploadCertificatePDF(pdfBuffer, verification_code);

            // Store in database
            await supabase
              .from('certificates')
              .insert([
                {
                  user_id,
                  course_id: enrollment.course_id,
                  certificate_url,
                  verification_code,
                  issued_at: new Date().toISOString(),
                },
              ]);

            console.log(
              `🎓 Certificate auto-generated for User ${user_id} → Course ${enrollment.course_id}`
            );
          }
        }
      } catch (certError) {
        console.error('⚠️ Certificate auto-generation failed (non-critical):', certError.message);
        // Don't fail the quiz submission if certificate generation fails
      }
    }
  } catch (error) {
    console.error('🔴 Quiz submission error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to submit quiz',
    });
  }
});

/**
 * GET /api/quizzes/:quizId/attempts
 * Get all attempts for a quiz by current user
 * Protected: Requires JWT authentication
 */
router.get('/:quizId/attempts', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const user_id = req.user.id;

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('id, score, passed, attempted_at')
      .eq('quiz_id', quizId)
      .eq('user_id', user_id)
      .order('attempted_at', { ascending: false });

    if (error) {
      console.error('🔴 Error fetching attempts:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch attempts',
      });
    }

    const bestScore = attempts && attempts.length > 0 
      ? Math.max(...attempts.map(a => a.score))
      : null;
    const hasPassed = attempts?.some(a => a.passed) || false;

    res.status(200).json({
      attempts: attempts || [],
      best_score: bestScore,
      has_passed: hasPassed,
      attempt_count: attempts?.length || 0,
    });
  } catch (error) {
    console.error('🔴 Attempts fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch attempts',
    });
  }
});

/**
 * GET /api/quizzes/module/:moduleId
 * Get quiz for a module (fetch with questions for admin/preview)
 * Public endpoint
 */
router.get('/module/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, description, pass_mark, module_id')
      .eq('module_id', moduleId)
      .single();

    if (!quiz || quizError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No quiz found for this module',
      });
    }

    // Fetch questions WITHOUT correct_option
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, order_index')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch quiz questions',
      });
    }

    res.status(200).json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        pass_mark: quiz.pass_mark,
        module_id: quiz.module_id,
        total_questions: questions?.length || 0,
      },
      questions: questions || [],
    });
  } catch (error) {
    console.error('🔴 Quiz fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch quiz',
    });
  }
});

export default router;
