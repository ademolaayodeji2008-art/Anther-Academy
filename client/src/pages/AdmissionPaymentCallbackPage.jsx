import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdmissionPaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('');
  const [eoiData, setEOIData] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found. Please try again.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const eoiId = localStorage.getItem('admission_payment_eoi_id');

      const response = await axios.get(
        `${API_BASE_URL}/api/payments/admission-form/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { eoi_id: eoiId },
        }
      );

      if (response.data.status === 'success') {
        setStatus('success');
        setMessage('Payment verified successfully!');
        setEOIData(response.data.eoi);
        
        // Clear stored reference
        localStorage.removeItem('admission_payment_reference');
        localStorage.removeItem('admission_payment_eoi_id');
        
        // Redirect to courses page after 5 seconds
        setTimeout(() => {
          navigate('/courses');
        }, 5000);
      } else {
        setStatus('failed');
        setMessage(response.data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setStatus('failed');
      setMessage(err.response?.data?.message || 'Payment verification failed. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-6 py-20">
        {status === 'verifying' && (
          <div className="card p-12 text-center bg-white">
            <Loader className="w-16 h-16 text-navy-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Verifying Payment...
            </h1>
            <p className="text-slate-600">
              Please wait while we confirm your admission form payment.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="card p-12 text-center bg-white">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-slate-700 mb-6">
              {message}
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-green-900 mb-3">What's Next?</h3>
              <div className="text-left space-y-3 text-green-800">
                <p>✓ Your admission form fee payment has been confirmed</p>
                <p>✓ You can now apply for your desired course</p>
                <p>✓ Browse our course catalog and select a programme</p>
                <p>✓ Complete the full 14-step application form</p>
                <p>✓ Upload all required documents</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/courses')}
                className="w-full px-8 py-4 bg-navy-600 hover:bg-navy-700 text-white text-lg font-bold rounded-lg transition-colors"
              >
                Browse Courses & Apply
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Redirecting to courses page in 5 seconds...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="card p-12 text-center bg-white">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              Payment Failed
            </h1>
            <p className="text-lg text-slate-700 mb-6">
              {message}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-red-900 mb-3">What to do next:</h3>
              <ul className="space-y-2 text-red-800 text-sm">
                <li>• Check that your card has sufficient funds</li>
                <li>• Verify that your card is enabled for online payments</li>
                <li>• Try again with a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
                <li>• Email us at <a href="mailto:hello@antheracademy.com" className="underline">hello@antheracademy.com</a> for support</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/admission-form-payment')}
                className="w-full px-8 py-4 bg-navy-600 hover:bg-navy-700 text-white text-lg font-bold rounded-lg transition-colors"
              >
                Try Payment Again
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
