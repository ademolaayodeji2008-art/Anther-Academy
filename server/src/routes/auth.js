import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
// Create new user with role "student", generate OTP, send email
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, confirm_password } = req.body;

    // Validation
    if (!full_name || !email || !password || !confirm_password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, and password are required',
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Passwords do not match',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters',
      });
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered. Please login or use a different email.',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          full_name,
          email,
          phone: phone || null,
          password_hash,
          role: 'student', // Always 'student' on registration
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('🔴 Error creating user:', createError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create user account',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in database (using a temporary field or separate table)
    // For now, we'll store it in a simple way using a temporary table
    const { error: otpError } = await supabase
      .from('users')
      .update({
        email_verification_code: otp,
        email_verification_expires_at: otp_expires_at.toISOString(),
      })
      .eq('id', newUser.id);

    if (otpError) {
      console.error('🔴 Error storing OTP:', otpError);
    }

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('⚠️  OTP email send failed:', emailError.message);
      // Don't fail the registration, user can request resend
    }

    console.log(`✅ User registered: ${email} (OTP: ${otp})`);

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent.',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
      next_step: 'verify-otp',
    });
  } catch (error) {
    console.error('🔴 Registration error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Registration failed. Please try again later.',
    });
  }
});

// POST /api/auth/verify-otp
// Verify OTP and set email_verified = true
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and OTP are required',
      });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || userError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Check if email already verified
    if (user.email_verified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'This email is already verified',
      });
    }

    // Check if OTP matches
    if (user.email_verification_code !== otp) {
      console.warn(`⚠️  Invalid OTP attempt for ${email}`);
      return res.status(401).json({
        error: 'Invalid OTP',
        message: 'The OTP you entered is incorrect',
      });
    }

    // Check if OTP expired
    const now = new Date();
    const expiresAt = new Date(user.email_verification_expires_at);

    if (now > expiresAt) {
      return res.status(401).json({
        error: 'OTP expired',
        message: 'The OTP has expired. Please request a new one.',
      });
    }

    // Mark email as verified and clear OTP
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_code: null,
        email_verification_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('🔴 Error updating user:', updateError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to verify email',
      });
    }

    console.log(`✅ Email verified for user: ${email}`);

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        email_verified: true,
      },
      next_step: 'login',
    });
  } catch (error) {
    console.error('🔴 OTP verification error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'OTP verification failed',
    });
  }
});

// POST /api/auth/resend-otp
// Regenerate and resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email is required',
      });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || userError) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'This email is already verified',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verification_code: otp,
        email_verification_expires_at: otp_expires_at.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('🔴 Error updating OTP:', updateError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to regenerate OTP',
      });
    }

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('⚠️  OTP email send failed:', emailError.message);
      return res.status(500).json({
        error: 'Email service error',
        message: 'Failed to send OTP email. Please try again later.',
      });
    }

    console.log(`✅ OTP resent to: ${email}`);

    res.status(200).json({
      message: 'OTP has been sent to your email. It expires in 10 minutes.',
      expires_in_minutes: 10,
    });
  } catch (error) {
    console.error('🔴 Resend OTP error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to resend OTP',
    });
  }
});

// POST /api/auth/login
// Validate credentials, return JWT if successful
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || userError) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email before logging in',
        next_step: 'verify-email',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.warn(`⚠️  Invalid password attempt for ${email}`);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('🔴 Login error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Login failed. Please try again later.',
    });
  }
});

// GET /api/auth/me
// Get current user info (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, email_verified, created_at')
      .eq('id', req.user.id)
      .single();

    if (!user || error) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('🔴 Get user error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch user info',
    });
  }
});

// POST /api/auth/logout
// Logout (client-side JWT removal, but good for audit logging)
router.post('/logout', authenticateToken, (req, res) => {
  // JWT logout is client-side (token removal from storage)
  // This endpoint is optional, mainly for logging user logout
  console.log(`✅ User logged out: ${req.user.email}`);

  res.status(200).json({
    message: 'Logout successful',
  });
});

export default router;
