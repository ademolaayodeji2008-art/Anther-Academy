import nodemailer from 'nodemailer';

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SMTP_USER,
    pass: process.env.GMAIL_SMTP_PASS,
  },
});

// Generate random 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Anther Academy - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c5aa0;">Anther Academy</h1>
            <h2 style="color: #1e3a52;">Email Verification</h2>
          </div>
          
          <div style="background-color: #f1f5fb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
              Welcome to Anther Academy! To complete your registration, please verify your email address using the code below.
            </p>
            
            <div style="text-align: center; padding: 20px; background-color: white; border-radius: 6px; margin-bottom: 20px;">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Your verification code:</p>
              <p style="font-size: 32px; font-weight: bold; color: #2c5aa0; letter-spacing: 5px; margin: 0;">
                ${otp}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Anther Academy. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email');
  }
}

// Send password reset email (for future implementation)
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Anther Academy - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5aa0;">Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 12px;">This link expires in 1 hour.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw new Error('Failed to send password reset email');
  }
}

// Send contact form submission email
export async function sendContactEmail({ name, email, subject, message }) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM_ADDRESS;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5aa0;">New Contact Form Submission</h2>
          
          <div style="background-color: #f1f5fb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #374151; line-height: 1.6;">
              ${message}
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Anther Academy. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Contact form email received from ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending contact email:', error.message);
    throw new Error('Failed to send contact email');
  }
}
