import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CourseThumbnail from '../components/CourseThumbnail';
import StatusAlert from '../components/StatusAlert';
import { BookOpen, Award, CheckCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  const user = authService.getStoredUser();
  const token = authService.getToken();

  const handleRetry = () => {
    setError('');
    setEnrollments([]);
    setProgressData({});
    setRetryTrigger(prev => prev + 1); // Trigger re-fetch
  };

  useEffect(() => {
    const fetchEnrollmentsAndProgress = async () => {
      try {
        setIsLoading(true);
        setError('');

        if (!user?.id || !token) {
          setError('Authentication failed');
          setIsLoading(false);
          return;
        }

        // Fetch enrollments
        const enrollmentsRes = await axios.get(
          `${API_BASE_URL}/api/enrollments/user/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const activeEnrollments = enrollmentsRes.data.enrollments.filter(
          e => e.status === 'active'
        );
        setEnrollments(activeEnrollments);

        // Fetch progress for each course
        const progressMap = {};
        for (const enrollment of activeEnrollments) {
          try {
            const progressRes = await axios.get(
              `${API_BASE_URL}/api/progress/${enrollment.course_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            progressMap[enrollment.course_id] = progressRes.data.stats;
          } catch (err) {
            console.error(`Error fetching progress for course ${enrollment.course_id}:`, err);
          }
        }
        setProgressData(progressMap);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Couldn\'t load your courses — please try again');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && token) {
      fetchEnrollmentsAndProgress();
    }
  }, [user?.id, token, retryTrigger]); // ✅ Use stable primitives + retryTrigger

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading your courses...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-600">Continue your learning journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg flex items-start gap-3">
            <div className="flex-grow">
              <p className="font-medium text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-1">Check your connection or try again in a moment</p>
            </div>
            <button
              onClick={handleRetry}
              className="ml-auto whitespace-nowrap px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* My Courses Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-navy-900">My Courses</h2>
              <p className="text-slate-600 mt-1">
                {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <Link to="/courses" className="btn-outline px-6 py-2">
              Browse More
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="card p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl font-medium text-slate-900 mb-2">No courses yet</p>
              <p className="text-slate-600 mb-6">
                Start learning by enrolling in a course
              </p>
              <Link to="/courses" className="btn-primary">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => {
                const progress = progressData[enrollment.course_id];
                const progressPercent = progress?.progress_percentage || 0;

                return (
                  <Link
                    key={enrollment.id}
                    to={`/learning/${enrollment.id}`}
                    className="card overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  >
                    {/* Course Thumbnail */}
                    <div className="h-40 bg-slate-200 overflow-hidden relative">
                      <CourseThumbnail 
                        src={enrollment.courses?.thumbnail_url}
                        alt={enrollment.courses?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {progressPercent === 100 && (
                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-navy-600 transition line-clamp-2">
                        {enrollment.courses?.title}
                      </h3>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-slate-600">
                            Attendance
                          </span>
                          <span className="text-xs font-bold text-navy-600">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gold-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {progress?.message ? (
                            progress.message
                          ) : (
                            <>
                              {progress?.attended_sessions || 0} of{' '}
                              {progress?.total_sessions || 0} sessions attended
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <span className="text-sm font-medium text-navy-500">
                          {progressPercent === 100 ? 'Completed' : 'Continue'}
                        </span>
                        <span className="text-navy-500 font-medium">
                          {progressPercent === 100 ? 'Take Quiz →' : 'Resume →'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 bg-gradient-to-br from-navy-50 to-blue-50">
              <div className="text-3xl font-bold text-navy-900 mb-1">
                {enrollments.length}
              </div>
              <p className="text-slate-600">Courses Enrolled</p>
            </div>
            <div className="card p-6 bg-gradient-to-br from-gold-50 to-amber-50">
              <div className="text-3xl font-bold text-navy-900 mb-1">
                {Math.round(
                  Object.values(progressData).reduce((sum, p) => sum + (p?.progress_percentage || 0), 0) /
                    (Object.keys(progressData).length || 1)
                )}%
              </div>
              <p className="text-slate-600">Average Progress</p>
            </div>
            <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-3xl font-bold text-navy-900 mb-1">
                {Object.values(progressData).filter(p => p?.progress_percentage === 100).length}
              </div>
              <p className="text-slate-600">Courses Completed</p>
            </div>
          </div>
        )}

        {/* Certificates Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Your Certificates</h2>
              <p className="text-slate-600 mt-1">Earned credentials from completed courses</p>
            </div>
            <Link to="/certificates" className="btn-primary">
              View All Certificates →
            </Link>
          </div>

          <div className="card p-8 text-center bg-gradient-to-br from-gold-50 to-yellow-50">
            <Award className="w-20 h-20 text-gold-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-navy-900 mb-2">
              Complete courses and pass quizzes to earn certificates
            </p>
            <p className="text-slate-600 mb-6">
              Each certificate is unique, verifiable, and shareable with employers
            </p>
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
