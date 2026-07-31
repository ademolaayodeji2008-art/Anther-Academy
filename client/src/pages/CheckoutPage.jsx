import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const [step, setStep] = useState('course-info'); // course-info → enrollment-created → processing → success/error
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);

  const user = authService.getStoredUser();
  const token = authService.getToken();

  useEffect(() => {
    // Redirect if not logged in
    if (!user || !token) {
      navigate(`/login?redirect=/checkout/${courseSlug}`);
      return;
    }

    // Fetch course details
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses/${courseSlug}`);
        setCourse(response.data.course);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Could not load course information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseSlug, user, token, navigate]);

  /**
   * Step 1: Create enrollment with "pending_payment" status
   */
  const handleCreateEnrollment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      const response = await axios.post(
        `${API_BASE_URL}/api/enrollments`,
        { course_id: course.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEnrollment(response.data.enrollment);
      setStep('enrollment-created');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create enrollment');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Step 2: Initialize Paystack payment
   */
  const handleInitializePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');
      setStep('processing');

      const response = await axios.post(
        `${API_BASE_URL}/api/payments/initialize`,
        { enrollment_id: enrollment.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Store the reference for later use
      setPaymentReference(response.data.reference);

      // Redirect to Paystack checkout
      window.location.href = response.data.authorization_url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
      setStep('enrollment-created');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading course details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="card p-8 text-center">
            <p className="text-xl font-medium text-slate-900 mb-2">Course not found</p>
            <Link to="/courses" className="btn-primary">
              Back to Courses
            </Link>
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
        {/* Page Header */}
        <div className="mb-12">
          <Link to={`/courses/${courseSlug}`} className="text-navy-500 hover:text-navy-700 font-medium mb-4 inline-block">
            ← Back to Course
          </Link>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Complete Your Enrollment</h1>
          <p className="text-slate-600">Secure your spot in {course.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Course Info */}
            {step === 'course-info' && (
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Course Information</h2>

                <div className="space-y-6">
                  <div className="flex gap-6">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-navy-900 mb-2">{course.title}</h3>
                      <p className="text-slate-600 mb-4">{course.description}</p>
                      <div className="flex gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration_weeks} weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-navy-900 mb-4">Student Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Full Name:</span>
                        <span className="font-medium text-navy-900">{user?.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Email:</span>
                        <span className="font-medium text-navy-900">{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateEnrollment}
                    disabled={isProcessing}
                    className="btn-primary w-full mt-8"
                  >
                    {isProcessing ? 'Creating enrollment...' : 'Continue to Payment'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Enrollment Created */}
            {step === 'enrollment-created' && enrollment && (
              <div className="card p-8">
                <div className="text-center mb-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-navy-900">Enrollment Created</h2>
                  <p className="text-slate-600 mt-2">Ready to proceed to payment</p>
                </div>

                <div className="bg-navy-50 p-6 rounded-lg mb-8">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Enrollment ID:</span>
                      <span className="font-mono text-navy-900">{enrollment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Course:</span>
                      <span className="text-navy-900">{course.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                        Pending Payment
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                  <p className="text-sm text-blue-700">
                    <strong>Next:</strong> Click "Proceed to Payment" to securely pay via Paystack. You'll be redirected to complete your payment.
                  </p>
                </div>

                <button
                  onClick={handleInitializePayment}
                  disabled={isProcessing}
                  className="btn-primary w-full mb-3"
                >
                  {isProcessing ? 'Redirecting to Paystack...' : 'Proceed to Payment'}
                </button>

                <button
                  onClick={() => navigate(`/courses/${courseSlug}`)}
                  className="btn-outline w-full"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Step 3: Processing */}
            {step === 'processing' && (
              <div className="card p-8 text-center">
                <div className="inline-block mb-6">
                  <div className="w-16 h-16 border-4 border-navy-200 border-t-navy-500 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Processing Payment</h2>
                <p className="text-slate-600">Redirecting to Paystack. Please wait...</p>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Order Summary</h3>

              <div className="space-y-4 pb-6 border-b border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">{course.title}</span>
                  <span className="font-medium text-navy-900">₦{course.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="py-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900">Total</span>
                  <span className="text-2xl font-bold text-gold-500">₦{course.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-gold-500 mt-0.5">✓</span>
                  <span>Secure payment via Paystack</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-gold-500 mt-0.5">✓</span>
                  <span>Instant access to course materials</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-gold-500 mt-0.5">✓</span>
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-gold-500 mt-0.5">✓</span>
                  <span>Certificate upon completion</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                  💳 <strong>Payment Method:</strong> Paystack (Card, Bank Transfer, USSD)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
