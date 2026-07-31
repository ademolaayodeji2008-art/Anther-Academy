import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../lib/authService';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const verifiedEmail = location.state?.email || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(!!location.state?.verified);
  const [formData, setFormData] = useState({
    email: verifiedEmail || '',
    password: '',
  });

  // Auto-hide verification message after 5 seconds
  useEffect(() => {
    if (showVerificationMessage) {
      const timer = setTimeout(() => {
        setShowVerificationMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showVerificationMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.password) {
        throw new Error('Password is required');
      }

      // Call login API
      const response = await authService.login(formData.email, formData.password);

      console.log('✅ Login successful');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.error === 'Email not verified') {
        setError('Please verify your email before logging in. Resend the OTP to your email.');
      } else if (err.error === 'Invalid credentials') {
        setError('Email or password is incorrect');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Login to your learning account</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Verification Success Message */}
          {showVerificationMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">✅ Email verified! You can now login.</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
                disabled={isLoading}
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-navy-500 hover:text-navy-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="text-navy-500 font-medium hover:text-navy-700"
              >
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            🔒 <strong>Your password is securely hashed.</strong> Never share your login credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
