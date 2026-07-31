import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * CheckoutGuard: Verifies that a student has been admitted for a specific course
 * before allowing access to checkout
 * 
 * Usage: Wrap CheckoutPage with this component
 */
export default function CheckoutGuard({ children }) {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const user = authService.getStoredUser();
  const token = authService.getToken();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAdmission = async () => {
      try {
        setChecking(true);

        // Must be logged in
        if (!user || !token) {
          setError('You must be logged in to proceed with checkout.');
          setIsAuthorized(false);
          setChecking(false);
          return;
        }

        // Fetch course by slug
        const courseResponse = await axios.get(
          `${API_BASE_URL}/api/courses/${courseSlug}`
        );
        const courseData = courseResponse.data.course;
        setCourse(courseData);

        // Check if student has admitted application for this course
        const appResponse = await axios.get(
          `${API_BASE_URL}/api/admin/applications?course_id=${courseData.id}&status=admitted`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Look for an application for this user
        const userApplication = appResponse.data.applications?.find(
          app => app.user_id === user.id || app.email_address === user.email
        );

        if (!userApplication) {
          setError(
            `You need to complete and be admitted through our application process before enrolling in ${courseData.title}.`
          );
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error verifying admission:', err);
        if (err.response?.status === 404) {
          setError('Course not found.');
        } else {
          setError('Unable to verify your admission status. Please try again.');
        }
        setIsAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    if (user && token && courseSlug) {
      verifyAdmission();
    } else if (!user || !token) {
      setError('You must be logged in to proceed with checkout.');
      setChecking(false);
    }
  }, [user?.id, token, courseSlug]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-navy-600 rounded-full mb-4"></div>
          <p className="text-slate-600">Verifying your admission...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Admission Required</h2>
          <p className="text-slate-700 mb-6">{error}</p>
          
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <strong>To enroll:</strong>
            </p>
            <ol className="text-sm text-slate-600 list-decimal list-inside space-y-2 text-left">
              <li>Click "Apply Now" from the course page</li>
              <li>Complete the application form</li>
              <li>Wait for admin review and admission decision</li>
              <li>Receive admission email with payment link</li>
              <li>Proceed to checkout and enroll</li>
            </ol>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => navigate(`/courses/${courseSlug}`)}
              className="flex-1 px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white font-medium rounded-lg transition-colors"
            >
              View Course
            </button>
            {course && (
              <button
                onClick={() => navigate(`/apply/${course.slug}`)}
                className="flex-1 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User is authorized - render the checkout page
  return children;
}
