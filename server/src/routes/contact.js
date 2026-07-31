import express from 'express';
import { sendContactEmail } from '../utils/emailService.js';

const router = express.Router();

/**
 * POST /api/contact
 * Receive contact form submission and send email to admin
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'All fields are required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email address',
      });
    }

    // Message length check
    if (message.length < 10) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message must be at least 10 characters long',
      });
    }

    // Send email to admin
    try {
      await sendContactEmail({
        name,
        email,
        subject,
        message,
      });
    } catch (emailError) {
      console.error('⚠️  Contact email send failed:', emailError.message);
      // Don't fail the request, but log it
    }

    console.log(`✅ Contact form submission received from ${email}`);

    res.status(200).json({
      message: 'Thank you for reaching out. We will get back to you soon.',
      submitted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('🔴 Contact form error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to process your message. Please try again later.',
    });
  }
});

export default router;
