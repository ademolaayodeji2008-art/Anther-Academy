import express from 'express';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateCertificatePDF, generateVerificationCode } from '../utils/certificateGenerator.js';
import { uploadCertificatePDF } from '../utils/cloudinaryUpload.js';

const router = express.Router();

/**
 * POST /api/certificates/generate
 * Trigger certificate generation for a completed course
 * Called after quiz passed or manually by admin
 * Protected: Requires JWT authentication
 */
router.post('/generate', authenticateToken, async (req, res) => {
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

    // Verify enrollment exists and is active
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .eq('status', 'active')
      .single();

    if (!enrollment || enrollmentError) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not enrolled in this course or enrollment is not active',
      });
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', user_id)
      .single();

    if (!user || userError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Fetch course data
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', course_id)
      .single();

    if (!course || courseError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course not found',
      });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id, certificate_url, verification_code')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existingCert) {
      return res.status(200).json({
        message: 'Certificate already generated',
        certificate: existingCert,
      });
    }

    // Generate verification code
    const verification_code = generateVerificationCode();

    // Generate PDF certificate
    const pdfBuffer = await generateCertificatePDF({
      full_name: user.full_name,
      course_title: course.title,
      completion_date: new Date().toISOString(),
      verification_code,
    });

    // Upload to Cloudinary
    const certificate_url = await uploadCertificatePDF(pdfBuffer, verification_code);

    // Store certificate in database
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert([
        {
          user_id,
          course_id,
          certificate_url,
          verification_code,
          issued_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (certError) {
      console.error('🔴 Error storing certificate:', certError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to store certificate',
      });
    }

    console.log(`✅ Certificate generated: User ${user_id} → Course ${course_id}, Code: ${verification_code}`);

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate.id,
        certificate_url: certificate.certificate_url,
        verification_code: certificate.verification_code,
        issued_at: certificate.issued_at,
      },
    });
  } catch (error) {
    console.error('🔴 Certificate generation error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to generate certificate',
    });
  }
});

/**
 * GET /api/certificates/course/:courseId
 * Get certificate for a course (if earned by authenticated user)
 * Protected: Requires JWT authentication
 */
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.id;

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('id, certificate_url, verification_code, issued_at')
      .eq('user_id', user_id)
      .eq('course_id', courseId)
      .single();

    if (!certificate || error) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Certificate not found for this course',
      });
    }

    res.status(200).json({
      certificate,
    });
  } catch (error) {
    console.error('🔴 Certificate fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch certificate',
    });
  }
});

/**
 * GET /api/certificates/user/:userId
 * Get all certificates earned by a user
 * Protected: Requires JWT (can only view own certificates or admin)
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to view their own or admins to view all
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own certificates',
      });
    }

    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_url,
        verification_code,
        issued_at,
        courses (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('🔴 Error fetching certificates:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch certificates',
      });
    }

    res.status(200).json({
      certificates: certificates || [],
      total: certificates?.length || 0,
    });
  } catch (error) {
    console.error('🔴 Certificates fetch error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch certificates',
    });
  }
});

/**
 * GET /api/certificates/verify/:code
 * Public endpoint: Verify certificate authenticity
 * No authentication required - anyone can verify
 */
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Validate code format
    if (!code || code.length < 10) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Certificate code is invalid',
      });
    }

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        id,
        verification_code,
        issued_at,
        users (
          full_name
        ),
        courses (
          title
        )
      `)
      .eq('verification_code', code.toUpperCase())
      .single();

    if (!certificate || error) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Certificate not found or invalid code',
        verified: false,
      });
    }

    // Return only public information
    res.status(200).json({
      verified: true,
      certificate: {
        student_name: certificate.users?.full_name,
        course_title: certificate.courses?.title,
        issue_date: new Date(certificate.issued_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        verification_code: certificate.verification_code,
      },
    });
  } catch (error) {
    console.error('🔴 Certificate verification error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify certificate',
      verified: false,
    });
  }
});

/**
 * DELETE /api/certificates/:certificateId
 * Delete certificate (admin only or user's own)
 * Protected: Requires JWT authentication
 */
router.delete('/:certificateId', authenticateToken, async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Fetch certificate
    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select('id, user_id, verification_code')
      .eq('id', certificateId)
      .single();

    if (!certificate || fetchError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Certificate not found',
      });
    }

    // Check authorization (owner or admin)
    if (req.user.id !== certificate.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own certificates',
      });
    }

    // Delete from Cloudinary
    await deleteCertificatePDF(certificate.verification_code);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certificateId);

    if (deleteError) {
      console.error('🔴 Error deleting certificate:', deleteError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete certificate',
      });
    }

    console.log(`✅ Certificate deleted: ${certificateId}`);

    res.status(200).json({
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    console.error('🔴 Certificate deletion error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete certificate',
    });
  }
});

export default router;
