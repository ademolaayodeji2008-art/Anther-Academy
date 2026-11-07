import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdmissionFormPaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [eoiData, setEOIData] = useState(null);
  const [authError, setAuthError] = useState(false);

  const ADMISSION_FEE = 2000; // ₦2,000

  useEffect(() => {
    checkAdmissionStatus();
  }, []);

  const checkAdmissionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      // Get current user
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = userResponse.data.user.id;
      const userEmail = userResponse.data.user.email;

      // Check if user has an admitted EOI
      const eoiResponse = await axios.get(`${API_BASE_URL}/api/eoi/check-admission`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { user_id: userId, email: userEmail },
      });

      const eoi = eoiResponse.data.eoi;

      if (!eoi) {
        setError('No admission record found. Please submit an Expression of Interest first.');
        setLoading(false);
        return;
      }

      if (eoi.admission_status !== 'admitted') {
        setError('Your Expression of Interest has not been admitted yet. Please wait for admission decision.');
        setLoading(false);
        return;
      }

      if (eoi.admission_form_paid) {
        setError('You have already paid the admission form fee. You can now proceed to the application form.');
        setLoading(false);
        return;
      }

      setEOIData(eoi);
      setLoading(false);
    } catch (err) {
      console.error('Error checking admission status:', err);
      setError(err.response?.data?.message || 'Failed to verify admission status');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Initialize payment
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/admission-form/initialize`,
        {
          eoi_id: eoiData.id,
          amount: ADMISSION_FEE,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { authorization_url, reference } = response.data;

      // Store reference for verification after redirect
      localStorage.setItem('admission_payment_reference', reference);
      localStorage.setItem('admission_payment_eoi_id', eoiData.id);

      // Redirect to Paystack
      window.location.href = authorization_url;
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="card p-12 text-center bg-white">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-navy-900 mb-4">Authentication Required</h1>
            <p className="text-slate-600 mb-6">
              Please log in to access the admission form payment page.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="card p-12 text-center bg-white">
            <Loader className="w-12 h-12 text-navy-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Verifying admission status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !eoiData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="card p-12 text-center bg-white">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-navy-900 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/expression-of-interest')}
                className="btn-primary"
              >
                Submit Expression of Interest
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border-2 border-navy-500 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            Admission Form Payment
          </h1>
          <p className="text-slate-600">
            Complete your payment to access the full application form
          </p>
        </div>

        {/* Congratulations Card */}
        <div className="card p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Congratulations, {eoiData?.first_name}!
              </h2>
              <p className="text-green-800 text-lg mb-2">
                Your Expression of Interest has been reviewed and <strong>approved</strong>.
              </p>
              <p className="text-green-700">
                You have been admitted to the ANTHER Academy programme. To proceed with your application,
                please complete the admission form payment below.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="card p-8 bg-white mb-6">
          <h3 className="text-xl font-bold text-navy-900 mb-6">Payment Details</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-slate-700">Admission Form Fee</span>
              <span className="text-lg font-semibold text-navy-900">
                ₦{ADMISSION_FEE.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-lg font-medium text-slate-900">Total Amount</span>
              <span className="text-2xl font-bold text-navy-900">
                ₦{ADMISSION_FEE.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">What happens after payment?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your payment will be verified instantly</li>
              <li>✓ You'll gain access to the full application form (14 steps)</li>
              <li>✓ You can upload all required documents</li>
              <li>✓ Our team will review your complete application</li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Payment Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-lg transition-colors"
          >
            {processing ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                Pay ₦{ADMISSION_FEE.toLocaleString()} Now
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Secure payment powered by Paystack. You will be redirected to complete your payment.
          </p>
        </div>

        {/* Info Card */}
        <div className="card p-6 bg-slate-50 border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Important Information</h4>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• This is a <strong>one-time, non-refundable</strong> admission form fee</li>
            <li>• Payment gives you access to submit the full application form</li>
            <li>• Course enrollment fees are separate and will be paid after application approval</li>
            <li>• Keep your payment receipt for reference</li>
            <li>• For payment issues, contact: <a href="mailto:hello@antheracademy.com" className="text-navy-600 underline">hello@antheracademy.com</a></li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
