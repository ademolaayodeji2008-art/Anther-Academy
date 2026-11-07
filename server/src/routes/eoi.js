import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { createPasswordResetToken } from '../utils/passwordResetToken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * UTILITY: Count words in text
 */
const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * UTILITY: Send admission notification email
 */
const sendEOIAdmissionEmail = async (email, fullName, admissionFeeAmount = 2000) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SMTP_USER,
        pass: process.env.GMAIL_SMTP_PASS,
      },
    });

    const paymentLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admission-form-payment`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: '🎉 Congratulations! You Have Been Admitted to Anther Academy',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #1a3a52;">Congratulations, ${fullName}!</h2>
          
          <p>We are pleased to inform you that your Expression of Interest has been reviewed and <strong>APPROVED</strong>.</p>
          
          <h3 style="color: #1a3a52; margin-top: 24px;">✅ Next Step: Pay Admission Form Fee</h3>
          <p>To proceed with your full application, please pay the admission form fee of <strong>₦${admissionFeeAmount.toLocaleString()}</strong>.</p>
          
          <p style="margin: 20px 0;">
            <a href="${paymentLink}" style="display: inline-block; background-color: #1a3a52; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Pay Admission Form Fee (₦${admissionFeeAmount.toLocaleString()})
            </a>
          </p>
          
          <h3 style="color: #1a3a52; margin-top: 24px;">📋 What Happens Next?</h3>
          <ol style="line-height: 2;">
            <li>Pay the admission form fee using the link above</li>
            <li>After payment confirmation, you'll receive access to the full application form</li>
            <li>Complete the detailed application form with all required documents</li>
            <li>Our team will review your application and notify you of the final decision</li>
          </ol>
          
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
    console.log(`✅ EOI admission email sent to ${email}`);
  } catch (err) {
    console.error('🔴 Error sending EOI admission email:', err);
    // Don't fail the whole operation if email fails
  }
};

/**
 * POST /api/eoi
 * Submit Expression of Interest
 * Public endpoint
 */
router.post('/', async (req, res) => {
  try {
    const formData = req.body;

    // Validation: Required fields
    if (!formData.surname || !formData.first_name || !formData.email_address || !formData.phone_whatsapp_number) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'surname, first_name, email_address, and phone_whatsapp_number are required',
      });
    }

    // Validation: Consent must be true
    if (formData.consent_information_accurate !== true || formData.consent_data_storage !== true) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Both consent fields must be accepted to submit',
      });
    }

    // Validation: Motivation word count (30-100 words)
    if (formData.why_interested) {
      const wordCount = countWords(formData.why_interested);
      if (wordCount < 30 || wordCount > 100) {
        return res.status(400).json({
          error: 'Validation error',
          field: 'why_interested',
          wordCount,
          message: `Motivation must be 30-100 words (currently ${wordCount} words)`,
        });
      }
    }

    // Check if email already submitted
    const { data: existing } = await supabase
      .from('expressions_of_interest')
      .select('id, admission_status')
      .eq('email_address', formData.email_address)
      .single();

    if (existing) {
      return res.status(400).json({
        error: 'Duplicate submission',
        message: 'An expression of interest with this email already exists',
        status: existing.admission_status,
      });
    }

    // Create EOI record
    const { data: eoi, error: insertError } = await supabase
      .from('expressions_of_interest')
      .insert([{
        surname: formData.surname,
        first_name: formData.first_name,
        email_address: formData.email_address,
        phone_whatsapp_number: formData.phone_whatsapp_number,
        gender: formData.gender || null,
        state_of_residence: formData.state_of_residence || null,
        highest_qualification: formData.highest_qualification || null,
        field_of_study: formData.field_of_study || null,
        institution_attended: formData.institution_attended || null,
        year_completed: formData.year_completed || null,
        professional_status: formData.professional_status || null,
        nysc_status: formData.nysc_status || null,
        work_experience: formData.work_experience || null,
        current_excel_level: formData.current_excel_level || null,
        preferred_intake_month: formData.preferred_intake_month || null,
        areas_of_interest: formData.areas_of_interest || [],
        how_heard: formData.how_heard || null,
        how_heard_other: formData.how_heard_other || null,
        why_interested: formData.why_interested,
        can_attend_hybrid_training: formData.can_attend_hybrid_training === true,
        can_complete_field_internship: formData.can_complete_field_internship || null,
        internship_conditions: formData.internship_conditions || null,
        consent_information_accurate: true,
        consent_data_storage: true,
        applicant_name: formData.applicant_name || null,
        applicant_signature: formData.applicant_signature || null,
        signature_date: formData.signature_date || null,
        admission_status: 'pending',
      }])
      .select()
      .single();

    if (insertError) {
      console.error('🔴 Error inserting EOI:', insertError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to submit expression of interest',
      });
    }

    console.log(`✅ EOI submitted: ${eoi.id} for ${formData.email_address}`);

    res.status(201).json({
      message: 'Expression of interest submitted successfully',
      eoi_id: eoi.id,
      email: formData.email_address,
      next_steps: 'Our admissions team will review your expression and notify you if approved.',
    });
  } catch (err) {
    console.error('🔴 Error in POST /eoi:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/eoi
 * Admin only: List all EOI submissions
 */
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

    const { admission_status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('expressions_of_interest')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (admission_status) {
      query = query.eq('admission_status', admission_status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: eois, count, error } = await query;

    if (error) {
      console.error('🔴 Error fetching EOIs:', error);
      return res.status(500).json({ error: 'Failed to fetch expressions of interest' });
    }

    res.status(200).json({
      message: 'Expressions of interest retrieved',
      eois: eois || [],
      pagination: {
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (err) {
    console.error('🔴 Error in GET /eoi:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/eoi/:id
 * Admin only: Get single EOI details
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

    const { data: eoi, error } = await supabase
      .from('expressions_of_interest')
      .select(`
        *,
        admitted_by_user:admitted_by (id, full_name)
      `)
      .eq('id', id)
      .single();

    if (!eoi || error) {
      return res.status(404).json({ error: 'Expression of interest not found' });
    }

    res.status(200).json({
      message: 'Expression of interest retrieved',
      eoi,
    });
  } catch (err) {
    console.error('🔴 Error in GET /eoi/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/eoi/:id/admit
 * Admin only: Grant admission to EOI applicant
 * Creates user account and sends admission email with payment link
 */
router.patch('/:id/admit', authenticateToken, async (req, res) => {
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
    const { admission_notes } = req.body;

    // Fetch EOI
    const { data: eoi, error: fetchError } = await supabase
      .from('expressions_of_interest')
      .select('*')
      .eq('id', id)
      .single();

    if (!eoi || fetchError) {
      return res.status(404).json({ error: 'Expression of interest not found' });
    }

    if (eoi.admission_status === 'admitted') {
      return res.status(400).json({ error: 'This applicant has already been admitted' });
    }

    // Create user account (with temporary password)
    let userId = eoi.user_id;

    if (!userId) {
      try {
        // Check if user with this email already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', eoi.email_address)
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const tempPassword = crypto.randomBytes(16).toString('hex');
          const passwordHash = await bcrypt.hash(tempPassword, 10);

          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              email: eoi.email_address,
              full_name: `${eoi.first_name} ${eoi.surname}`,
              phone: eoi.phone_whatsapp_number,
              role: 'student',
              email_verified: true, // Pre-verified through EOI process
              password_hash: passwordHash,
            })
            .select('id')
            .single();

          if (userError) {
            console.error('🔴 Error creating user account:', userError);
            return res.status(500).json({ error: 'Failed to create user account' });
          }

          userId = newUser.id;
          console.log(`✅ User account created for admitted applicant: ${userId}`);
        }
      } catch (err) {
        console.error('🔴 Error in user creation:', err);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
    }

    // Update EOI with admission
    const { data: updatedEOI, error: updateError } = await supabase
      .from('expressions_of_interest')
      .update({
        admission_status: 'admitted',
        admitted_at: new Date().toISOString(),
        admitted_by: user.id,
        admission_notes,
        user_id: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('🔴 Error updating EOI:', updateError);
      return res.status(500).json({ error: 'Failed to update admission status' });
    }

    // Log to audit
    await supabase.from('eoi_audit_log').insert({
      eoi_id: id,
      admin_id: user.id,
      action: 'admitted',
      old_admission_status: eoi.admission_status,
      new_admission_status: 'admitted',
      notes: admission_notes,
    });

    // Send admission email
    try {
      await sendEOIAdmissionEmail(
        eoi.email_address,
        `${eoi.first_name} ${eoi.surname}`,
        2000
      );
    } catch (err) {
      console.error('🔴 Error sending admission email:', err);
    }

    console.log(`✅ Admin ${user.id} admitted EOI ${id}`);

    res.status(200).json({
      message: 'Admission granted successfully',
      eoi: updatedEOI,
    });
  } catch (err) {
    console.error('🔴 Error in PATCH /eoi/:id/admit:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/eoi/:id/reject
 * Admin only: Reject EOI application
 */
router.patch('/:id/reject', authenticateToken, async (req, res) => {
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
    const { admission_notes } = req.body;

    // Fetch EOI
    const { data: eoi, error: fetchError } = await supabase
      .from('expressions_of_interest')
      .select('*')
      .eq('id', id)
      .single();

    if (!eoi || fetchError) {
      return res.status(404).json({ error: 'Expression of interest not found' });
    }

    // Update EOI status
    const { data: updatedEOI, error: updateError } = await supabase
      .from('expressions_of_interest')
      .update({
        admission_status: 'not_admitted',
        admitted_by: user.id,
        admission_notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('🔴 Error updating EOI:', updateError);
      return res.status(500).json({ error: 'Failed to update admission status' });
    }

    // Log to audit
    await supabase.from('eoi_audit_log').insert({
      eoi_id: id,
      admin_id: user.id,
      action: 'rejected',
      old_admission_status: eoi.admission_status,
      new_admission_status: 'not_admitted',
      notes: admission_notes,
    });

    console.log(`✅ Admin ${user.id} rejected EOI ${id}`);

    res.status(200).json({
      message: 'EOI rejected',
      eoi: updatedEOI,
    });
  } catch (err) {
    console.error('🔴 Error in PATCH /eoi/:id/reject:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/eoi/check-admission
 * Check if user has admitted EOI (authenticated user)
 */
router.get('/check-admission', authenticateToken, async (req, res) => {
  try {
    const { user_id, email } = req.query;

    if (!user_id && !email) {
      return res.status(400).json({ error: 'user_id or email required' });
    }

    let query = supabase.from('expressions_of_interest').select('*');

    if (user_id) {
      query = query.eq('user_id', user_id);
    } else {
      query = query.eq('email_address', email);
    }

    query = query.order('created_at', { ascending: false });

    const { data: eois, error } = await query;

    if (error || !eois || eois.length === 0) {
      return res.status(404).json({ error: 'No EOI found for this user' });
    }

    // Return the most recent EOI
    const eoi = eois[0];

    res.status(200).json({
      message: 'EOI found',
      eoi,
    });
  } catch (err) {
    console.error('🔴 Error in GET /eoi/check-admission:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
