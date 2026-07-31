import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, ChevronLeft, Loader, FileText, Image as ImageIcon, ExternalLink, Save } from 'lucide-react';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = authService.getStoredUser();
  const token = authService.getToken();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Review form state
  const [review, setReview] = useState({
    aptitude_test_score: '',
    interview_score: '',
    panel_comments: '',
    status: '',
  });

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== 'admin' || !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE_URL}/api/admin/applications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setApplication(response.data.application);
        setReview({
          aptitude_test_score: response.data.application.aptitude_test_score || '',
          interview_score: response.data.application.interview_score || '',
          panel_comments: response.data.application.panel_comments || '',
          status: response.data.application.status || 'under_review',
        });
      } catch (err) {
        console.error('Error fetching application:', err);
        if (err.response?.status === 404) {
          setError('Application not found');
        } else {
          setError(err.response?.data?.message || 'Failed to load application');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin' && id) {
      fetchApplication();
    }
  }, [id, user?.role, token, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewing(true);
    setReviewSuccess(false);

    try {
      // Validate scores
      if (review.aptitude_test_score && (review.aptitude_test_score < 0 || review.aptitude_test_score > 100)) {
        setError('Aptitude score must be between 0 and 100');
        setReviewing(false);
        return;
      }
      if (review.interview_score && (review.interview_score < 0 || review.interview_score > 100)) {
        setError('Interview score must be between 0 and 100');
        setReviewing(false);
        return;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/admin/applications/${id}/review`,
        {
          aptitude_test_score: review.aptitude_test_score ? parseInt(review.aptitude_test_score) : null,
          interview_score: review.interview_score ? parseInt(review.interview_score) : null,
          panel_comments: review.panel_comments,
          status: review.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplication(response.data.application);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="card p-12 text-center">
            <Loader className="w-8 h-8 text-navy-600 mx-auto animate-spin mb-3" />
            <p className="text-slate-600">Loading application...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/admin/applications')}
            className="flex items-center gap-2 text-navy-600 hover:text-navy-700 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Applications
          </button>
          <div className="card p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!application) return null;

  const DocumentLink = ({ url, publicId, label, isImage }) => {
    if (!url) {
      return <span className="text-slate-400">Not provided</span>;
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
      >
        {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        {label}
        <ExternalLink className="w-4 h-4" />
      </a>
    );
  };

  const docs = application.documents || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/applications')}
          className="flex items-center gap-2 text-navy-600 hover:text-navy-700 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Applications
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {reviewSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">Review saved successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Application Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card p-6 bg-gradient-to-r from-navy-50 to-blue-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Application Reference</p>
                  <p className="text-3xl font-mono font-bold text-navy-900">
                    {application.application_id_ref}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  {
                    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
                    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
                    admitted: 'bg-green-50 text-green-700 border-green-200',
                    waitlisted: 'bg-amber-50 text-amber-700 border-amber-200',
                    not_admitted: 'bg-red-50 text-red-700 border-red-200',
                  }[application.status]
                }`}>
                  {application.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Submitted</p>
                  <p className="font-medium text-slate-900">
                    {new Date(application.created_at).toLocaleDateString()} {new Date(application.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Course Applied</p>
                  <p className="font-medium text-slate-900">{application.courses?.title || 'Unknown'}</p>
                </div>
              </div>

              {/* Pipeline Status */}
              {application.status === 'admitted' && (
                <div className="mt-4 pt-4 border-t border-slate-300">
                  <p className="text-sm font-medium text-slate-600 mb-2">Pipeline Status</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-slate-700">Applied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-slate-700">Admitted</span>
                    </div>
                    <div className={`flex items-center gap-2 ${application.user_id ? 'text-slate-700' : 'text-slate-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${application.user_id ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                      <span>Account Created</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span>Payment Pending</span>
                    </div>
                  </div>
                  {!application.user_id && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      ⚠️ Account not yet created. Will be auto-created when review is saved.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-navy-900 mb-6 pb-3 border-b border-slate-200">
                Section A: Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Full Name</p>
                  <p className="font-medium text-slate-900">
                    {application.first_name} {application.surname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{application.email_address}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium text-slate-900">
                    {Array.isArray(application.phone_numbers) 
                      ? application.phone_numbers.join(', ') 
                      : application.phone_numbers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Gender</p>
                  <p className="font-medium text-slate-900">{application.gender || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-600">Address</p>
                  <p className="font-medium text-slate-900">{application.residential_address}</p>
                </div>
              </div>
            </div>

            {/* Professional Status */}
            {application.professional_status && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-navy-900 mb-6 pb-3 border-b border-slate-200">
                  Section C: Professional Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className="font-medium text-slate-900">{application.professional_status}</p>
                  </div>
                  {application.membership_reg_number && (
                    <div>
                      <p className="text-sm text-slate-600">Registration Number</p>
                      <p className="font-medium text-slate-900">{application.membership_reg_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Motivation */}
            {application.motivation_why_enrol && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-navy-900 mb-6 pb-3 border-b border-slate-200">
                  Section G: Motivation Statement
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Why enrol in this programme?</p>
                    <p className="text-slate-700 leading-relaxed">{application.motivation_why_enrol}</p>
                  </div>
                  {application.motivation_learning_experience && (
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">Learning experience expected</p>
                      <p className="text-slate-700 leading-relaxed">{application.motivation_learning_experience}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-navy-900 mb-6 pb-3 border-b border-slate-200">
                Section L: Uploaded Documents
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-2">Passport Photo</p>
                  <DocumentLink 
                    url={docs.passport_photo?.signedUrl || docs.passport_photo?.url} 
                    publicId={docs.passport_photo?.publicId}
                    label="View Photo"
                    isImage
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-2">Curriculum Vitae</p>
                  <DocumentLink 
                    url={docs.doc_cv?.signedUrl || docs.doc_cv?.url} 
                    publicId={docs.doc_cv?.publicId}
                    label="View CV"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-2">Academic Credentials</p>
                  <DocumentLink 
                    url={docs.doc_academic_credentials?.signedUrl || docs.doc_academic_credentials?.url} 
                    publicId={docs.doc_academic_credentials?.publicId}
                    label="View Credentials"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-2">NYSC Document</p>
                  <DocumentLink 
                    url={docs.doc_nysc_document?.signedUrl || docs.doc_nysc_document?.url} 
                    publicId={docs.doc_nysc_document?.publicId}
                    label="View Document"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-2">ICAN/ATSWA Evidence</p>
                  <DocumentLink 
                    url={docs.doc_ican_atswa_evidence?.signedUrl || docs.doc_ican_atswa_evidence?.url} 
                    publicId={docs.doc_ican_atswa_evidence?.publicId}
                    label="View Evidence"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-2">Valid ID</p>
                  <DocumentLink 
                    url={docs.doc_valid_id?.signedUrl || docs.doc_valid_id?.url} 
                    publicId={docs.doc_valid_id?.publicId}
                    label="View ID"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  ℹ️ Document links are temporary (1-hour expiry) for security. They are not cached and will be refreshed on revisit.
                </p>
              </div>
            </div>
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-navy-900 mb-6 pb-3 border-b border-slate-200">
                Admin Review
              </h2>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                {/* Aptitude Score */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Aptitude Test Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={review.aptitude_test_score}
                    onChange={(e) => setReview(prev => ({ ...prev, aptitude_test_score: e.target.value }))}
                    placeholder="Score"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>

                {/* Interview Score */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Interview Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={review.interview_score}
                    onChange={(e) => setReview(prev => ({ ...prev, interview_score: e.target.value }))}
                    placeholder="Score"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>

                {/* Decision */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Decision
                  </label>
                  <select
                    value={review.status}
                    onChange={(e) => setReview(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="admitted">Admitted</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="not_admitted">Not Admitted</option>
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Panel Comments
                  </label>
                  <textarea
                    value={review.panel_comments}
                    onChange={(e) => setReview(prev => ({ ...prev, panel_comments: e.target.value }))}
                    placeholder="Internal notes for admissions panel..."
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={reviewing}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-navy-900 font-bold rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {reviewing ? 'Saving...' : 'Save Review'}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-slate-100 border border-slate-300 rounded-lg">
                <p className="text-xs text-slate-700">
                  <strong>Note:</strong> Changes are saved immediately. If status changes to "admitted", an email notification will be sent to the applicant automatically.
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
