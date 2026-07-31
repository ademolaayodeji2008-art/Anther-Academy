import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../lib/authService';

export default function OTPVerificationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('registrationEmail') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOTPChange = (value) => {
    // Only allow digits, max 6
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digitsOnly);
    setError('');
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email not found. Please register again.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await authService.verifyOTP(email, otp);

      // Clear registration data
      localStorage.removeItem('registrationEmail');

      // Show success message
      console.log('✅ Email verified successfully');

      // Redirect to login
      navigate('/login', {
        state: { verified: true, email: email }
      });
    } catch (err) {
      if (err.error === 'OTP expired') {
        setError('The OTP has expired. Please request a new one.');
      } else if (err.error === 'Invalid OTP') {
        setError('The OTP you entered is incorrect. Please try again.');
      } else {
        setError(err.message || 'Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email not found. Please register again.');
      return;
    }

    setError('');
    setIsResending(true);

    try {
      await authService.resendOTP(email);
      setOtp('');
      setResendTimer(60); // 60 second cooldown
      setResendCount(prev => prev + 1);
      console.log('✅ OTP resent successfully');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Verify Email</h1>
          <p className="text-slate-600">We sent a code to {email}</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              📧 Enter the 6-digit code sent to your email. It expires in 10 minutes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => handleOTPChange(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="input-field text-center text-3xl letter-spacing tracking-widest font-bold"
                disabled={isLoading}
                autoComplete="off"
                inputMode="numeric"
                required
              />
              <p className="text-xs text-slate-500 mt-2 text-center">
                {otp.length}/6 digits entered
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isResending || resendTimer > 0}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                resendTimer > 0 || isResending
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              {isResending
                ? '⏳ Sending...'
                : resendTimer > 0
                ? `⏱️  Resend in ${resendTimer}s`
                : '🔄 Resend Code'}
            </button>
            {resendCount > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Resend requests: {resendCount}
              </p>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            <a 
              href="/register" 
              className="text-navy-500 hover:text-navy-700 font-medium"
            >
              Back to registration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
