import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadAuthenticatedToCloudinary } from '../utils/cloudinaryUpload.js';
import { createPasswordResetToken } from '../utils/passwordResetToken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const router = express.Router();

/**
 * UTILITY: Count words in text by splitting on whitespace
 * Returns count of non-empty words
 */
const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * UTILITY: Validate motivation field word count (150-200 words)
 * Returns: { valid: boolean, wordCount: number, error?: string }
 */
const validateMotivationWordCount = (text, fieldName = 'motivation') => {
  const wordCount = countWords(text);
  
  if (wordCount < 150) {
    return {
      valid: false,
      wordCount,
      error: `${fieldName} must be at least 150 words (you have ${wordCount} words)`,
    };
  }
  
  if (wordCount > 200) {
    return {
      valid: false,
      wordCount,
      error: `${fieldName} must not exceed 200 words (you have ${wordCount} words)`,
    };
  }
  
  return {
    valid: true,
    wordCount,
  };
};

/**
 * UTILITY: Generate application ID reference
 * Format: AA-{YYYY}-{5-digit sequence}
 */
const generateApplicationRef = async (year) => {
  try {
    // Get count of applications this year
    const { count, error } = await supabase
      .from('programme_applications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01T00:00:00Z`)
      .lt('created_at', `${year + 1}-01-01T00:00:00Z`);

    if (error) {
      console.error('🔴 Error getting application count:', error);
      return `AA-${year}-00001`;
    }

    const sequence = String((count || 0) + 1).padStart(5, '0');
    return `AA-${year}-${sequence}`;
  } catch (err) {
    console.error('🔴 Error generating ref:', err);
    return `AA-${year}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`;
  }
};

/**
 * UTILITY: Generate signed URL for authenticated Cloudinary assets
 * Expires in 1 hour by default
 */
const generateSignedCloudinaryUrl = (publicId, expirySeconds = 3600) => {
  try {
    // Cloudinary SDK approach - generate signed URL
    // For simplicity, we just return the URL - Cloudinary handles auth via public_id in authenticated folder
    // In production, use cloudinary.url() with signature
    const timestamp = Math.floor(Date.now() / 1000) + expirySeconds;
    return `${publicId}?timestamp=${timestamp}`;
  } catch (err) {
    console.error('🔴 Error generating signed URL:', err);
    return publicId;
  }
};

/**
 * UTILITY: Send admission notification email with password reset link
 */
const sendAdmissionEmail = async (email, fullName, applicationRef, courseName, courseId, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SMTP_USER,
        pass: process.env.GMAIL_SMTP_PASS,
      },
    });

    const setPasswordLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/set-password?token=${resetToken}`;
    const checkoutLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/${courseId}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: '🎉 Congratulations! You Have Been Admitted to Anther Academy',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #1a3a52;">Congratulations, ${fullName}!</h2>
          
          <p>We are pleased to inform you that your application to the <strong>${courseName}</strong> programme has been <strong>ADMITTED</strong>.</p>
          
          <p><strong>Application Reference:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${applicationRef}</code></p>
          
          <h3 style="color: #1a3a52; margin-top: 24px;">🔐 Set Your Password</h3>
          <p>Your account has been created. Click the button below to set your password and activate your account:</p>
          
          <p style="margin: 20px 0;">
            <a href="${setPasswordLink}" style="display: inline-block; background-color: #1a3a52; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Set Your Password
            </a>
          </p>
          
          <p><strong>⚠️ Important:</strong> This link expires in 24 hours. If it expires, you can request a new one on the login page.</p>
          
          <h3 style="color: #1a3a52; margin-top: 24px;">💳 Next Step: Complete Your Payment</h3>
          <p>Once you've set your password, you can proceed to complete your course payment:</p>
          
          <p style="margin: 20px 0;">
            <a href="${checkoutLink}" style="display: inline-block; background-color: #d4a574; color: #1a3a52; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Proceed to Checkout
            </a>
          </p>
          
          <h3 style="color: #1a3a52; margin-top: 24px;">📋 Your Login Details</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p>You'll use this email and the password you set to access your account and course materials.</p>
          
          <h3 style="color: #1a3a52; margin-top: 24px;">❓ Questions?</h3>
          <p>If you have any questions or need assistance, please contact our admissions team at <a href="mailto:hello@antheracademy.com">hello@antheracademy.com</a>.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Anther Academy<br>
            ${process.env.EMAIL_FROM_ADDRESS}<br>
            <strong>Note:</strong> This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admission email sent to ${email}`);
  } catch (err) {
    console.error('🔴 Error sending admission email:', err);
    // Don't fail the whole operation if email fails
  }
};

/**
 * POST /api/applications
 * Submit a programme application
 * Public endpoint - multipart form with 6 file uploads (authenticated Cloudinary)
 * Files: passport_photo, doc_cv, doc_academic_credentials, doc_nysc_document, doc_ican_atswa_evidence, doc_valid_id
 */
router.post('/', async (req, res) => {
  try {
    const { course_id, user_id, how_heard, how_heard_other, ...formData } = req.body;

    // Validation: Required fields
    if (!course_id) {
      return res.status(400).json({ error: 'course_id is required' });
    }

    if (!formData.surname || !formData.first_name || !formData.email_address || !formData.phone_numbers) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'surname, first_name, email_address, and phone_numbers are required',
      });
    }

    // Validation: Declaration & Consent must be true
    if (formData.declaration_accepted !== 'true' || formData.data_consent_accepted !== 'true') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Both declaration and data consent must be accepted to submit application',
      });
    }

    // Validation: Motivation fields must be 150-200 words (if provided)
    if (formData.motivation_why_enrol) {
      const motivationValidation = validateMotivationWordCount(
        formData.motivation_why_enrol,
        'motivation_why_enrol'
      );
      if (!motivationValidation.valid) {
        return res.status(400).json({
          error: 'Validation error',
          field: 'motivation_why_enrol',
          wordCount: motivationValidation.wordCount,
          message: motivationValidation.error,
        });
      }
      console.log(`✓ Validated motivation_why_enrol: ${motivationValidation.wordCount} words`);
    }

    if (formData.motivation_learning_experience) {
      const motivationValidation = validateMotivationWordCount(
        formData.motivation_learning_experience,
        'motivation_learning_experience'
      );
      if (!motivationValidation.valid) {
        return res.status(400).json({
          error: 'Validation error',
          field: 'motivation_learning_experience',
          wordCount: motivationValidation.wordCount,
          message: motivationValidation.error,
        });
      }
      console.log(`✓ Validated motivation_learning_experience: ${motivationValidation.wordCount} words`);
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', course_id)
      .single();

    if (!course || courseError) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Generate application reference
    const currentYear = new Date().getFullYear();
    const applicationRef = await generateApplicationRef(currentYear);

    console.log(`📝 Processing application for course ${course_id} with ref ${applicationRef}`);

    // Handle file uploads (if any files provided)
    const uploadedFiles = {};
    if (req.files) {
      const fileFieldMap = {
        passport_photo: ['passport_photo_url', 'passport_photo_public_id'],
        doc_cv: ['doc_cv_url', 'doc_cv_public_id'],
        doc_academic_credentials: ['doc_academic_credentials_url', 'doc_academic_credentials_public_id'],
        doc_nysc_document: ['doc_nysc_document_url', 'doc_nysc_document_public_id'],
        doc_ican_atswa_evidence: ['doc_ican_atswa_evidence_url', 'doc_ican_atswa_evidence_public_id'],
        doc_valid_id: ['doc_valid_id_url', 'doc_valid_id_public_id'],
      };

      for (const [fieldName, [urlField, publicIdField]] of Object.entries(fileFieldMap)) {
        if (req.files[fieldName]) {
          try {
            const uploadResult = await uploadAuthenticatedToCloudinary(
              req.files[fieldName],
              'programme-applications'
            );
            uploadedFiles[urlField] = uploadResult.secure_url;
            uploadedFiles[publicIdField] = uploadResult.public_id;
            console.log(`✅ Uploaded ${fieldName} to Cloudinary`);
          } catch (uploadErr) {
            console.error(`🔴 Error uploading ${fieldName}:`, uploadErr);
            return res.status(500).json({
              error: 'File upload error',
              message: `Failed to upload ${fieldName}`,
            });
          }
        }
      }
    }

    // Parse phone numbers if string
    let phoneNumbers = formData.phone_numbers;
    if (typeof phoneNumbers === 'string') {
      phoneNumbers = phoneNumbers.split(',').map(p => p.trim());
    }

    // Parse JSONB fields
    let qualifications = formData.qualifications;
    if (typeof qualifications === 'string') {
      try {
        qualifications = JSON.parse(qualifications);
      } catch (e) {
        qualifications = [];
      }
    }

    let workExperience = formData.work_experience;
    if (typeof workExperience === 'string') {
      try {
        workExperience = JSON.parse(workExperience);
      } catch (e) {
        workExperience = [];
      }
    }

    let skillRatings = formData.skill_ratings;
    if (typeof skillRatings === 'string') {
      try {
        skillRatings = JSON.parse(skillRatings);
      } catch (e) {
        skillRatings = {};
      }
    }

    // Create application record
    const { data: application, error: insertError } = await supabase
      .from('programme_applications')
      .insert([{
        course_id,
        user_id: user_id || null,
        application_id_ref: applicationRef,
        how_heard,
        how_heard_other,
        ...uploadedFiles,
        surname: formData.surname,
        first_name: formData.first_name,
        other_names: formData.other_names,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality,
        state_of_origin: formData.state_of_origin,
        state_of_residence: formData.state_of_residence,
        phone_numbers: phoneNumbers,
        email_address: formData.email_address,
        residential_address: formData.residential_address,
        next_of_kin_name: formData.next_of_kin_name,
        next_of_kin_relationship: formData.next_of_kin_relationship,
        next_of_kin_phone: formData.next_of_kin_phone,
        qualifications,
        professional_status: formData.professional_status,
        membership_reg_number: formData.membership_reg_number,
        date_registered: formData.date_registered,
        other_professional_certifications: formData.other_professional_certifications,
        nysc_status: formData.nysc_status,
        call_up_number: formData.call_up_number,
        state_of_deployment_ppa: formData.state_of_deployment_ppa,
        batch_stream: formData.batch_stream,
        discharge_date: formData.discharge_date,
        work_experience: workExperience,
        skill_ratings: skillRatings,
        motivation_why_enrol: formData.motivation_why_enrol,
        motivation_learning_experience: formData.motivation_learning_experience,
        can_attend_hybrid_training: formData.can_attend_hybrid_training === 'true',
        can_undertake_internship: formData.can_undertake_internship,
        internship_conditions_notes: formData.internship_conditions_notes,
        preferred_internship_location: formData.preferred_internship_location,
        known_scheduling_conflicts: formData.known_scheduling_conflicts,
        referee_full_name: formData.referee_full_name,
        referee_relationship: formData.referee_relationship,
        referee_organisation: formData.referee_organisation,
        referee_position: formData.referee_position,
        referee_phone: formData.referee_phone,
        referee_email: formData.referee_email,
        payment_preference: formData.payment_preference,
        instalment_count: formData.instalment_count ? parseInt(formData.instalment_count) : null,
        declaration_accepted: true,
        data_consent_accepted: true,
        promotional_use_consent: formData.promotional_use_consent === 'true',
      }])
      .select()
      .single();

    if (insertError) {
      console.error('🔴 Error inserting application:', insertError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to submit application',
      });
    }

    console.log(`✅ Application submitted: ${applicationRef}`);

    res.status(201).json({
      message: 'Application submitted successfully',
      application_id_ref: applicationRef,
      application_id: application.id,
      email: formData.email_address,
      next_steps: 'Check your email for further instructions. You can track your application status using your reference number.',
    });
  } catch (err) {
    console.error('🔴 Error in POST /applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/applications/status
 * Public: Check application status
 * Query: application_id_ref (required), email_address (required)
 * Returns: status only, NOT full data or document links
 */
router.get('/status', async (req, res) => {
  try {
    const { application_id_ref, email_address } = req.query;

    if (!application_id_ref || !email_address) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'application_id_ref and email_address required',
      });
    }

    const { data: application, error } = await supabase
      .from('programme_applications')
      .select('id, application_id_ref, status')
      .eq('application_id_ref', application_id_ref)
      .eq('email_address', email_address)
      .single();

    if (!application || error) {
      return res.status(404).json({
        error: 'Application not found',
        message: 'No application found with those credentials',
      });
    }

    res.status(200).json({
      application_id_ref: application.application_id_ref,
      status: application.status,
      status_message: {
        submitted: 'Your application has been received and is queued for review',
        under_review: 'Your application is currently being reviewed by our admissions panel',
        admitted: 'Congratulations! You have been admitted. Please proceed to complete enrollment payment.',
        waitlisted: 'Your application is on the waitlist. We will notify you of any updates.',
        not_admitted: 'Thank you for your interest. Unfortunately, your application was not successful at this time.',
      }[application.status],
    });
  } catch (err) {
    console.error('🔴 Error in GET /status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, course_id, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('programme_applications')
      .select(`
        id,
        application_id_ref,
        course_id,
        courses (title),
        email_address,
        first_name,
        surname,
        status,
        aptitude_test_score,
        interview_score,
        created_at,
        reviewed_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (course_id) {
      query = query.eq('course_id', course_id);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: applications, count, error } = await query;

    if (error) {
      console.error('🔴 Error fetching applications:', error);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }

    res.status(200).json({
      message: 'Applications retrieved',
      applications: applications || [],
      pagination: {
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (err) {
    console.error('🔴 Error in GET /admin/applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/applications/:id
 * Admin only: Full application detail with signed Cloudinary URLs
 * Returns: Complete application data including authenticated document URLs
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Check admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { data: application, error } = await supabase
      .from('programme_applications')
      .select(`
        *,
        courses (id, title),
        reviewed_by_user:reviewed_by (id, full_name)
      `)
      .eq('id', id)
      .single();

    if (!application || error) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Generate signed URLs for all authenticated Cloudinary assets
    // In production, use actual Cloudinary signing - for now return public_id
    const documentsWithSignedUrls = {
      passport_photo: {
        url: application.passport_photo_url,
        publicId: application.passport_photo_public_id,
        signedUrl: application.passport_photo_url ? generateSignedCloudinaryUrl(application.passport_photo_public_id) : null,
      },
      doc_cv: {
        url: application.doc_cv_url,
        publicId: application.doc_cv_public_id,
        signedUrl: application.doc_cv_url ? generateSignedCloudinaryUrl(application.doc_cv_public_id) : null,
      },
      doc_academic_credentials: {
        url: application.doc_academic_credentials_url,
        publicId: application.doc_academic_credentials_public_id,
        signedUrl: application.doc_academic_credentials_url ? generateSignedCloudinaryUrl(application.doc_academic_credentials_public_id) : null,
      },
      doc_nysc_document: {
        url: application.doc_nysc_document_url,
        publicId: application.doc_nysc_document_public_id,
        signedUrl: application.doc_nysc_document_url ? generateSignedCloudinaryUrl(application.doc_nysc_document_public_id) : null,
      },
      doc_ican_atswa_evidence: {
        url: application.doc_ican_atswa_evidence_url,
        publicId: application.doc_ican_atswa_evidence_public_id,
        signedUrl: application.doc_ican_atswa_evidence_url ? generateSignedCloudinaryUrl(application.doc_ican_atswa_evidence_public_id) : null,
      },
      doc_valid_id: {
        url: application.doc_valid_id_url,
        publicId: application.doc_valid_id_public_id,
        signedUrl: application.doc_valid_id_url ? generateSignedCloudinaryUrl(application.doc_valid_id_public_id) : null,
      },
    };

    res.status(200).json({
      message: 'Application detail retrieved',
      application: {
        ...application,
        documents: documentsWithSignedUrls,
      },
    });
  } catch (err) {
    console.error('🔴 Error in GET /admin/applications/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/admin/applications/:id/review
 * Admin only: Update application review scores and status
 * Body: {
 *   aptitude_test_score (0-100),
 *   interview_score (0-100),
 *   panel_comments,
 *   status ('submitted'|'under_review'|'admitted'|'waitlisted'|'not_admitted')
 * }
 */
router.patch('/admin/applications/:id/review', authenticateToken, async (req, res) => {
  try {
    // Check admin role
    const { data: user } = await supabase
      .from('users')
      .select('role, id')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { aptitude_test_score, interview_score, panel_comments, status } = req.body;

    // Validate scores
    if (aptitude_test_score !== undefined && (aptitude_test_score < 0 || aptitude_test_score > 100)) {
      return res.status(400).json({ error: 'aptitude_test_score must be between 0 and 100' });
    }
    if (interview_score !== undefined && (interview_score < 0 || interview_score > 100)) {
      return res.status(400).json({ error: 'interview_score must be between 0 and 100' });
    }

    // Fetch current application
    const { data: currentApp, error: fetchError } = await supabase
      .from('programme_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentApp || fetchError) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application
    const { data: updatedApp, error: updateError } = await supabase
      .from('programme_applications')
      .update({
        aptitude_test_score: aptitude_test_score !== undefined ? aptitude_test_score : currentApp.aptitude_test_score,
        interview_score: interview_score !== undefined ? interview_score : currentApp.interview_score,
        panel_comments: panel_comments !== undefined ? panel_comments : currentApp.panel_comments,
        status: status || currentApp.status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, courses (title), reviewed_by_user:reviewed_by (id, full_name)')
      .single();

    if (updateError) {
      console.error('🔴 Error updating application:', updateError);
      return res.status(500).json({ error: 'Failed to update application' });
    }

    console.log(`✅ Admin ${user.id} reviewed application ${id}: status → ${status}`);

    // Log to audit trail
    await supabase.from('application_audit_log').insert({
      application_id: id,
      admin_id: user.id,
      action: 'reviewed',
      old_status: currentApp.status,
      new_status: status,
      aptitude_test_score_change: aptitude_test_score !== undefined ? `${currentApp.aptitude_test_score} → ${aptitude_test_score}` : null,
      interview_score_change: interview_score !== undefined ? `${currentApp.interview_score} → ${interview_score}` : null,
      comments_change: panel_comments,
    });

    // Handle admission: create user account if needed and send admission email
    if (status === 'admitted' && currentApp.status !== 'admitted') {
      let userId = currentApp.user_id;

      // If no user account exists, create one
      if (!userId) {
        try {
          const tempPassword = crypto.randomBytes(16).toString('hex');
          const passwordHash = await bcrypt.hash(tempPassword, 10);

          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              email: currentApp.email_address,
              full_name: `${currentApp.first_name} ${currentApp.surname}`,
              phone: Array.isArray(currentApp.phone_numbers) 
                ? currentApp.phone_numbers[0] 
                : currentApp.phone_numbers,
              role: 'student',
              email_verified: true, // Mark as verified - already vetted through application
              password_hash: passwordHash,
            })
            .select('id')
            .single();

          if (userError) {
            console.error('🔴 Error creating user account:', userError);
            // Continue without creating user - email will indicate manual action needed
          } else {
            userId = newUser.id;
            console.log(`✅ User account created for admitted applicant: ${userId}`);
          }
        } catch (err) {
          console.error('🔴 Error in user creation:', err);
        }
      }

      // Link user_id to application if we have one
      if (userId) {
        await supabase
          .from('programme_applications')
          .update({ 
            user_id: userId,
            admitted_at: new Date().toISOString(),
          })
          .eq('id', id);
      }

      // Create password reset token for new account
      let resetToken = null;
      if (userId) {
        try {
          resetToken = await createPasswordResetToken(userId, 24);
          console.log(`✅ Password reset token created for user ${userId}`);
        } catch (err) {
          console.error('🔴 Error creating password reset token:', err);
        }
      }

      // Send admission email with password reset link and checkout link
      try {
        await sendAdmissionEmail(
          currentApp.email_address,
          `${currentApp.first_name} ${currentApp.surname}`,
          currentApp.application_id_ref,
          updatedApp.courses?.title || 'the programme',
          currentApp.course_id,
          resetToken || 'MANUAL_PASSWORD_RESET_REQUIRED'
        );
      } catch (err) {
        console.error('🔴 Error sending admission email:', err);
      }
    }

    res.status(200).json({
      message: 'Application review updated',
      application: updatedApp,
    });
  } catch (err) {
    console.error('🔴 Error in PATCH /review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
