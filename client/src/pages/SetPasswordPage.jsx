import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    password_confirm: '',
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setError('No token provided. This link is invalid.');
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/api/password-reset/verify-token`, {
          token,
        });

        setTokenValid(true);
        setUserEmail(response.data.email);
        setUserName(response.data.full_name);
      } catch (err) {
        console.error('Error verifying token:', err);
        setError(
          err.response?.data?.message ||
          'This password reset link is invalid or has expired. Please request a new one.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    const errors = [];

    if (!formData.password) errors.push('Password is required');
    if (!formData.password_confirm) errors.push('Password confirmation is required');
    if (formData.password && formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (formData.password !== formData.password_confirm) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setVerifying(true);
    try {
      await axios.post(`${API_BASE_URL}/api/password-reset/set-password`, {
        token,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error setting password:', err);
      setError(
        err.response?.data?.message ||
        'Failed to set password. Please try again or request a new reset link.'
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-md mx-auto px-6 py-20">
          <div className="card p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-navy-600 rounded-full mb-4"></div>
            <p className="text-slate-600">Verifying your link...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-blue-50">
      <Navigation />

      <div className="max-w-md mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Set Your Password</h1>
          <p className="text-slate-600">Create a secure password to activate your Anther Academy account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="card p-8 bg-green-50 border border-green-200">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Password Set Successfully!</h2>
              <p className="text-green-700 mb-6">
                Your password has been set. You can now log in to your account.
              </p>
              <p className="text-sm text-green-600 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : tokenValid ? (
          <div className="card p-8 bg-white">
            {/* User Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Account Email</p>
              <p className="font-medium text-blue-900">{userEmail}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  At least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Hint */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-medium text-slate-900 mb-2">Password Tips:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>✓ Use a mix of uppercase and lowercase letters</li>
                  <li>✓ Include numbers and special characters</li>
                  <li>✓ Avoid personal information (name, email, etc.)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                {verifying ? 'Setting Password...' : 'Set Password & Activate Account'}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ This link expires in 24 hours. If it expires, you can request a new password reset from the login page.
              </p>
            </div>
          </div>
        ) : (
          <div className="card p-8 bg-red-50 border border-red-200 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Link Invalid or Expired</h2>
            <p className="text-red-700 mb-6">
              The password reset link is no longer valid. This could mean it has expired or been used already.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
