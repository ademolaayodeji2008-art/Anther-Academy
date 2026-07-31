import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { initializeTransaction, verifyTransaction } from '../utils/paystackService.js';

const router = express.Router();

/**
 * POST /api/payments/initialize
 * Initialize a Paystack payment for course enrollment
 * Frontend will redirect user to authorization_url
 * Protected: Requires JWT authentication
 */
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { enrollment_id } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!enrollment_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'enrollment_id is required',
      });
    }

    // Fetch enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        status,
        courses (
          id,
          title,
          price
        )
      `)
      .eq('id', enrollment_id)
      .single();

    if (!enrollment || enrollmentError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Enrollment not found',
      });
    }

    // Verify enrollment belongs to current user
    if (enrollment.user_id !== user_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This enrollment does not belong to you',
      });
    }

    // Check if already paid
    if (enrollment.status === 'active') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'This enrollment is already active. You have already paid for this course.',
      });
    }

    // Get user email for payment
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (!user || userError) {
      return res.status(500).json({
        error: 'Server error',
        message: 'Failed to fetch user details',
      });
    }

    // Generate unique reference for this payment
    const paymentReference = `ENR-${enrollment_id}-${uuidv4().split('-')[0].toUpperCase()}`;

    // Amount in kobo (NGN * 100)
    const amountInKobo = enrollment.courses.price * 100;

    try {
      // Initialize Paystack transaction
      const paystackResult = await initializeTransaction({
        amount: amountInKobo,
        email: user.email,
        reference: paymentReference,
        metadata: {
          enrollment_id,
          course_id: enrollment.course_id,
          user_id,
          full_name: user.full_name,
          course_title: enrollment.courses.title,
        },
      });

      // Create payment record with "pending" status
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            user_id,
            course_id: enrollment.course_id,
            enrollment_id,
            amount: enrollment.courses.price,
            paystack_reference: paymentReference,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (paymentError) {
        console.error('🔴 Error creating payment record:', paymentError);
        // Still return authorization URL - we can recover from this
      }

      console.log(`✅ Payment initialized for enrollment ${enrollment_id}`);

      res.status(200).json({
        message: 'Payment initialization successful',
        authorization_url: paystackResult.authorization_url,
        access_code: paystackResult.access_code,
        reference: paymentReference,
        amount: enrollment.courses.price,
        course_title: enrollment.courses.title,
        enrollment_id,
        payment_id: payment?.id,
      });
    } catch (paystackError) {
      console.error('🔴 Paystack error:', paystackError.message);
      return res.status(500).json({
        error: 'Payment error',
        message: paystackError.message,
      });
    }
  } catch (error) {
    console.error('🔴 Payment initialization error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to initialize payment',
    });
  }
});

/**
 * POST /api/payments/verify
 * CRITICAL SERVER-SIDE VERIFICATION
 * Verify Paystack transaction and activate enrollment
 * NEVER trust client-side success flags - always verify against Paystack API
 * This is the #1 vulnerability in African fintech apps
 * Protected: Requires JWT authentication
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { reference, enrollment_id } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!reference || !enrollment_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'reference and enrollment_id are required',
      });
    }

    console.log(`🔐 VERIFYING PAYMENT - Reference: ${reference}, Enrollment: ${enrollment_id}`);

    // Step 1: Verify enrollment exists and belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, user_id, course_id, status')
      .eq('id', enrollment_id)
      .single();

    if (!enrollment || enrollmentError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Enrollment not found',
      });
    }

    if (enrollment.user_id !== user_id) {
      console.warn(`⚠️  Unauthorized payment verification attempt for enrollment ${enrollment_id}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This enrollment does not belong to you',
      });
    }

    if (enrollment.status === 'active') {
      return res.status(409).json({
        error: 'Already processed',
        message: 'This enrollment is already active',
      });
    }

    // Step 2: Verify payment record exists
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status, amount')
      .eq('paystack_reference', reference)
      .eq('enrollment_id', enrollment_id)
      .single();

    if (!payment || paymentError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Payment record not found',
      });
    }

    // Step 3: CHECK IF ALREADY VERIFIED (prevent double-charging)
    if (payment.status === 'success') {
      console.warn(`⚠️  Payment already verified: ${reference}`);
      return res.status(200).json({
        message: 'Payment already verified and enrollment already active',
        enrollment_id,
        status: 'already_processed',
      });
    }

    // Step 4: CRITICAL - Verify against Paystack API
    // This is the most important step - never skip this
    let verificationResult;
    try {
      verificationResult = await verifyTransaction(reference);
    } catch (verifyError) {
      console.error('🔴 Paystack verification failed:', verifyError.message);
      return res.status(500).json({
        error: 'Verification error',
        message: 'Failed to verify payment with Paystack',
      });
    }

    if (!verificationResult.success) {
      console.warn(`⚠️  Payment verification failed: ${reference} - Status: ${verificationResult.status}`);

      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: verificationResult.status || 'failed' })
        .eq('id', payment.id);

      return res.status(400).json({
        error: 'Payment not successful',
        message: `Payment status: ${verificationResult.status}. Please try again.`,
        reference,
      });
    }

    // Step 5: Paystack verified success - now activate enrollment
    console.log(`✅ PAYSTACK VERIFIED - Activating enrollment ${enrollment_id}`);

    // Update payment status to success
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('🔴 Error updating payment status:', paymentUpdateError);
      // Continue anyway - enrollment update is more critical
    }

    // Update enrollment status to active
    console.log(`📝 Updating enrollment ${enrollment_id} status to active...`);
    const { data: updatedEnrollment, error: enrollmentUpdateError } = await supabase
      .from('enrollments')
      .update({
        status: 'active',
        enrolled_at: new Date().toISOString(),
      })
      .eq('id', enrollment_id)
      .select(`
        id,
        user_id,
        course_id,
        status,
        enrolled_at,
        courses (
          id,
          title,
          slug,
          thumbnail_url,
          price
        )
      `)
      .single();

    if (enrollmentUpdateError) {
      console.error('🔴 Error updating enrollment:', enrollmentUpdateError);
      return res.status(500).json({
        error: 'Server error',
        message: 'Payment verified but failed to activate enrollment',
      });
    }

    if (!updatedEnrollment) {
      console.error('🔴 No enrollment returned after update');
      return res.status(500).json({
        error: 'Server error',
        message: 'Payment verified but enrollment not found',
      });
    }

    console.log(`🎉 ENROLLMENT ACTIVATED - User ${user_id} → Course ${enrollment.course_id}, Status: ${updatedEnrollment.status}`);

    res.status(200).json({
      message: 'Payment verified successfully. Enrollment activated!',
      enrollment: updatedEnrollment,
      payment_reference: reference,
      status: 'success',
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
 * GET /api/payments/:reference
 * Check payment status
 * Public endpoint - safe to call from client
 */
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    console.log(`🔍 Fetching payment record for reference: ${reference}`);

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, user_id, course_id, enrollment_id, amount, status, created_at, paystack_reference')
      .eq('paystack_reference', reference)
      .single();

    if (error) {
      console.error(`🔴 Error fetching payment ${reference}:`, error);
    }

    if (!payment || error) {
      console.warn(`⚠️  Payment not found for reference: ${reference}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Payment not found',
      });
    }

    console.log(`✅ Payment found: ${payment.id}, Status: ${payment.status}, Enrollment: ${payment.enrollment_id}`);

    res.status(200).json({
      payment,
      is_successful: payment.status === 'success',
    });
  } catch (error) {
    console.error('🔴 Payment status error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch payment status',
    });
  }
});

/**
 * POST /api/payments/webhook
 * Paystack webhook callback (future implementation)
 * For processing webhooks sent by Paystack server-to-server
 * NOT triggered by frontend redirect
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`📡 Received Paystack webhook: ${event}`);

    // Validate webhook (you should verify PAYSTACK webhook signature)
    if (event === 'charge.success') {
      const { reference, customer, amount } = data;

      console.log(`✅ Webhook: Payment successful - ${reference}`);
      // Process the payment here if not already processed
      // This provides a backup verification mechanism
    }

    res.status(200).json({
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('🔴 Webhook error:', error.message);
    res.status(500).json({
      error: 'Server error',
    });
  }
});

export default router;
