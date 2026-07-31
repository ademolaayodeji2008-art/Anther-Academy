import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reference = searchParams.get('reference');
  const token = authService.getToken();
  const user = authService.getStoredUser();

  useEffect(() => {
    // Check authentication
    if (!user || !token) {
      navigate('/login');
      return;
    }

    // Check reference parameter
    if (!reference) {
      setStatus('error');
      setError('Payment reference not found. Please contact support.');
      return;
    }

    // Verify payment ONCE on mount
    const verify = async () => {
      try {
        console.log(`🔐 Verifying payment: ${reference}`);

        // Get payment record
        const paymentRes = await axios.get(`${API_BASE_URL}/api/payments/${reference}`);
        const { payment } = paymentRes.data;

        if (!payment) {
          setStatus('error');
          setError('Payment record not found.');
          return;
        }

        // Call verify endpoint
        const verifyRes = await axios.post(
          `${API_BASE_URL}/api/payments/verify`,
          { reference, enrollment_id: payment.enrollment_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessage('Payment verified! Your enrollment is now active.');
        setStatus('success');
      } catch (err) {
        console.error('Verification error:', err.response?.status, err.response?.data);

        // Handle 409 (already active) as success
        if (err.response?.status === 409) {
          setMessage('Your payment was already processed. Your enrollment is active!');
          setStatus('success');
          return;
        }

        setStatus('error');
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to verify payment. Please try again.'
        );
      }
    };

    verify();
  }, []); // Empty dependency - run once on mount only

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="card p-12 text-center">
            <div className="w-16 h-16 border-4 border-navy-200 border-t-navy-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Verifying Payment</h1>
            <p className="text-slate-600">Please wait...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="card p-12 text-center bg-gradient-to-br from-green-50 to-navy-50">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Payment Successful!</h1>
            <p className="text-lg text-slate-600 mb-8">{message}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/dashboard" className="btn-primary flex-1 text-center">
                Go to Dashboard
              </Link>
              <Link to="/courses" className="btn-outline flex-1 text-center">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="card p-12 text-center bg-gradient-to-br from-red-50 to-navy-50">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-700 mb-2">Payment Verification Failed</h1>
          <p className="text-lg text-slate-600 mb-8">{error}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/courses" className="btn-primary flex-1 text-center">
              Back to Courses
            </Link>
            <a href="mailto:support@antheracademy.com" className="btn-outline flex-1 text-center">
              Contact Support
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
