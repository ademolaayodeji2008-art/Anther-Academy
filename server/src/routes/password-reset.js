import express from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { verifyPasswordResetToken, markTokenAsUsed } from '../utils/passwordResetToken.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * POST /api/password-reset/verify-token
 * Public: Verify that a password reset token is valid
 * Body: { token }
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const userId = await verifyPasswordResetToken(token);

    if (!userId) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'This link has expired or is invalid. Please request a new password reset.',
      });
    }

    // Get user details (email only, for confirmation)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (!user || error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Token is valid',
      user_id: userId,
      email: user.email,
      full_name: user.full_name,
    });
  } catch (err) {
    console.error('🔴 Error verifying token:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/password-reset/set-password
 * Public: Set password using a valid token
 * Body: { token, password, password_confirm }
 */
router.post('/set-password', async (req, res) => {
  try {
    const { token, password, password_confirm } = req.body;

    if (!token || !password || !password_confirm) {
      return res.status(400).json({ error: 'Token, password, and confirmation are required' });
    }

    if (password !== password_confirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Verify token
    const userId = await verifyPasswordResetToken(token);

    if (!userId) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'This link has expired or is invalid. Please request a new password reset.',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    if (updateError) {
      console.error('🔴 Error updating password:', updateError);
      return res.status(500).json({ error: 'Failed to set password' });
    }

    // Mark token as used
    await markTokenAsUsed(token);

    console.log(`✅ Password set successfully for user ${userId}`);

    res.status(200).json({
      message: 'Password set successfully',
      user_id: userId,
      next_step: 'You can now log in with your email and password',
    });
  } catch (err) {
    console.error('🔴 Error setting password:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/password-reset/status/:userId
 * Authenticated: Check if a user has a pending password reset token
 */
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if requesting user is the target user or an admin
    if (req.user.id !== userId) {
      const { data: admin } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Check for valid (unused) reset tokens
    const { data: tokens, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('user_id', userId)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    res.status(200).json({
      has_pending_token: !error && tokens,
      expires_at: tokens?.expires_at || null,
    });
  } catch (err) {
    console.error('🔴 Error checking token status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
