import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ApplicationStatusPage() {
  const navigate = useNavigate();
  const [applicationRef, setApplicationRef] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const statusConfig = {
    submitted: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      message: 'Your application has been received and is queued for review by our admissions panel.',
    },
    under_review: {
      icon: Eye,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      message: 'Your application is currently being reviewed by our admissions panel.',
    },
    admitted: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Congratulations! You have been admitted. Please check your email for next steps on completing your enrollment payment.',
    },
    waitlisted: {
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      message: 'Your application is on the waitlist. We will notify you of any updates as soon as possible.',
    },
    not_admitted: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Thank you for your interest. Unfortunately, your application was not successful at this time.',
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!applicationRef.trim() || !email.trim()) {
      setError('Please enter both your application reference and email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/applications/status?application_id_ref=${applicationRef}&email_address=${email}`
      );

      setStatus(response.data.status);
      setStatusMessage(response.data.status_message);
      setSubmitted(true);
    } catch (err) {
      console.error('Error checking status:', err);
      if (err.response?.status === 404) {
        setError('Application not found. Please check your reference number and email address.');
      } else {
        setError(err.response?.data?.message || 'Failed to retrieve your application status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApplicationRef('');
    setEmail('');
    setStatus(null);
    setStatusMessage('');
    setSubmitted(false);
    setError(null);
  };

  const config = status ? statusConfig[status] : null;
  const StatusIcon = config ? config.icon : null;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Check Your Application Status</h1>
          <p className="text-lg text-navy-100">Track your Anther Academy programme application in real-time</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {!submitted ? (
          /* Status Checker Form */
          <div className="card p-8 bg-white">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Enter Your Application Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Application Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={applicationRef}
                  onChange={(e) => setApplicationRef(e.target.value.toUpperCase())}
                  placeholder="e.g., AA-2026-00001"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-lg font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">You received this reference when you submitted your application</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email you used to apply"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-navy-900 font-bold rounded-lg transition-colors"
              >
                {loading ? 'Checking Status...' : 'Check Status'}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">Need help?</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• If you've lost your reference number, check the confirmation email you received</li>
                <li>• Make sure you're using the email address you provided in your application</li>
                <li>• Contact us at hello@antheracademy.com if you have any questions</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Status Display */
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`card p-8 border-2 ${config.borderColor} ${config.bgColor}`}>
              <div className="flex items-start gap-4 mb-4">
                <StatusIcon className={`w-12 h-12 ${config.color} flex-shrink-0`} />
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold ${config.color} mb-2`}>
                    {status === 'admitted' ? '🎉 Congratulations!' : 'Application Status'}
                  </h2>
                  <p className={`text-lg ${config.color}`}>
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-current opacity-30">
                <p className={`leading-relaxed ${config.color}`}>{statusMessage}</p>
              </div>
            </div>

            {/* Application Reference */}
            <div className="card p-6 bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Application Reference</p>
              <p className="text-2xl font-mono font-bold text-navy-900">{applicationRef}</p>
            </div>

            {/* Next Steps */}
            <div className="card p-6 bg-blue-50 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">What Happens Next?</h3>
              {status === 'submitted' && (
                <ul className="space-y-2 text-sm text-blue-900">
                  <li>• Our admissions panel is reviewing your application</li>
                  <li>• We typically complete reviews within 5-7 business days</li>
                  <li>• You'll receive an email update as soon as a decision is made</li>
                  <li>• Check back here anytime to see the latest status</li>
                </ul>
              )}
              {status === 'under_review' && (
                <ul className="space-y-2 text-sm text-blue-900">
                  <li>• Your application is actively being reviewed</li>
                  <li>• We may contact you for additional information if needed</li>
                  <li>• A final decision will be made shortly</li>
                  <li>• You'll receive an email notification when the review is complete</li>
                </ul>
              )}
              {status === 'admitted' && (
                <ul className="space-y-2 text-sm text-blue-900">
                  <li>• You have been admitted to the programme</li>
                  <li>• Check your email for payment and enrollment instructions</li>
                  <li>• Complete your payment to secure your spot in the course</li>
                  <li>• You'll receive course materials and schedule after enrollment</li>
                </ul>
              )}
              {status === 'waitlisted' && (
                <ul className="space-y-2 text-sm text-blue-900">
                  <li>• Your application is being held on a waitlist</li>
                  <li>• If a space becomes available, you'll be notified by email</li>
                  <li>• Waitlisted candidates are reviewed on a first-come basis</li>
                  <li>• Keep an eye on your email for updates</li>
                </ul>
              )}
              {status === 'not_admitted' && (
                <ul className="space-y-2 text-sm text-blue-900">
                  <li>• Unfortunately, your application was not selected this round</li>
                  <li>• You're welcome to apply for other upcoming programmes</li>
                  <li>• For feedback on your application, contact hello@antheracademy.com</li>
                  <li>• You can reapply in future cohorts</li>
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 border-2 border-navy-500 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium"
              >
                Check Another Application
              </button>
              <a
                href="/courses"
                className="flex-1 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors font-medium text-center"
              >
                View Other Courses
              </a>
            </div>

            {/* Contact Info */}
            <div className="card p-4 bg-slate-50 border border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                Have questions? Contact us at{' '}
                <a href="mailto:hello@antheracademy.com" className="text-navy-600 font-medium hover:underline">
                  hello@antheracademy.com
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
