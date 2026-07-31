import crypto from 'crypto';
import supabase from '../config/supabase.js';

/**
 * Generate a secure one-time token for password reset
 * Returns both the plaintext token (to send to user) and hash (to store in DB)
 */
export function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

/**
 * Create a password reset token for a user
 * Returns the plaintext token to be sent in email
 */
export async function createPasswordResetToken(userId, expiryHours = 24) {
  try {
    const { token, tokenHash } = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const { error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('🔴 Error creating password reset token:', error);
      throw error;
    }

    console.log(`✅ Password reset token created for user ${userId}`);
    return token; // Return plaintext token to be sent in email
  } catch (err) {
    console.error('🔴 Error in createPasswordResetToken:', err);
    throw err;
  }
}

/**
 * Verify and use a password reset token
 * Returns the user_id if valid, null if invalid/expired/already used
 */
export async function verifyPasswordResetToken(token) {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find the token
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (!resetToken || error) {
      console.log('🟡 Password reset token not found');
      return null;
    }

    // Check if expired
    if (new Date(resetToken.expires_at) < new Date()) {
      console.log('🟡 Password reset token expired');
      return null;
    }

    // Check if already used
    if (resetToken.used_at) {
      console.log('🟡 Password reset token already used');
      return null;
    }

    return resetToken.user_id;
  } catch (err) {
    console.error('🔴 Error verifying password reset token:', err);
    return null;
  }
}

/**
 * Mark a password reset token as used
 */
export async function markTokenAsUsed(token) {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);

    if (error) {
      console.error('🔴 Error marking token as used:', error);
      throw error;
    }

    console.log('✅ Password reset token marked as used');
  } catch (err) {
    console.error('🔴 Error in markTokenAsUsed:', err);
    throw err;
  }
}
