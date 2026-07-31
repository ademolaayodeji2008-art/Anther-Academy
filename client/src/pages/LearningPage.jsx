import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LessonViewer from '../components/LessonViewer';
import { AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function LearningPage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [courseStatus, setCourseStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = authService.getToken();
  const user = authService.getStoredUser();

  useEffect(() => {
    const fetchEnrollmentAndCourse = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch enrollment
        const enrollmentsRes = await axios.get(
          `${API_BASE_URL}/api/enrollments/user/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const currentEnrollment = enrollmentsRes.data.enrollments.find(
          e => e.id === enrollmentId && e.status === 'active'
        );

        if (!currentEnrollment) {
          setError('Enrollment not found or not active');
          return;
        }

        setEnrollment(currentEnrollment);

        // Fetch course details
        const courseRes = await axios.get(
          `${API_BASE_URL}/api/courses/${currentEnrollment.courses.slug}`
        );
        setCourse(courseRes.data.course);
        setModules(courseRes.data.course.modules || []);

        // Set first lesson as current
        if (courseRes.data.course.modules?.length > 0) {
          const firstLesson = courseRes.data.course.modules[0].lessons?.[0];
          if (firstLesson) {
            setCurrentLesson(firstLesson);
          }
        }

        // Fetch progress
        const progressRes = await axios.get(
          `${API_BASE_URL}/api/progress/${currentEnrollment.course_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const progressMap = {};
        progressRes.data.lessons.forEach(lesson => {
          progressMap[lesson.id] = lesson.is_completed;
        });
        setProgress(progressMap);

        // Fetch course completion status
        const statusRes = await axios.get(
          `${API_BASE_URL}/api/progress/course/${currentEnrollment.course_id}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseStatus(statusRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchEnrollmentAndCourse();
    }
  }, [enrollmentId, user, token]);

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading course...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-900 mb-2">{error || 'Course not found'}</p>
            <Link to="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const isLessonComplete = progress[currentLesson.id];
  const isCourseComplete = courseStatus?.is_complete;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="flex h-screen bg-slate-50 pt-16">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 flex-shrink-0`}
        >
          <div className="p-6">
            <div className="mb-6">
              <Link to="/dashboard" className="text-navy-500 hover:text-navy-700 font-medium text-sm mb-4 inline-block">
                ← Back to Dashboard
              </Link>
              <h2 className="text-xl font-bold text-navy-900 mb-2">{course.title}</h2>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Progress</span>
                  <span className="text-xs font-bold text-navy-600">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gold-400 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {completedCount} of {totalLessons} lessons
                </p>
              </div>

              {isCourseComplete && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm text-green-700 font-medium">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Course complete! Quiz unlocked.
                  </p>
                </div>
              )}
            </div>

            {/* Modules & Lessons */}
            <div className="space-y-4">
              {modules.map((module, modIdx) => (
                <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-navy-900">
                      {modIdx + 1}. {module.title}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {module.lessons?.map((lesson, lesIdx) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isComplete = progress[lesson.id];

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            isActive
                              ? 'bg-navy-50 text-navy-700 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{lesIdx + 1}.</span>
                            <span className="flex-grow">{lesson.title}</span>
                            {isComplete && <span className="text-green-600">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-6 p-2 hover:bg-slate-200 rounded-lg transition"
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {sidebarOpen ? '◄' : '►'}
            </button>

            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Current Lesson</p>
                  <h1 className="text-4xl font-bold text-navy-900">{currentLesson.title}</h1>
                </div>
                {isLessonComplete && (
                  <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Lesson Viewer */}
            <LessonViewer lesson={currentLesson} />

            {/* Action Buttons */}
            <div className="mt-12 flex gap-4 justify-between">
              <Link to="/dashboard" className="btn-outline px-6 py-3">
                ← Back to Dashboard
              </Link>

              <div className="flex gap-4">
                {/* REMOVED: "Mark Complete" button - students cannot self-mark progress */}
                {/* Progress is now tracked via admin-controlled session attendance only */}

                {isCourseComplete && (
                  <button
                    onClick={() => {
                      // For now, navigate with course_id; quiz matching by module will be handled
                      navigate(`/quiz/${enrollment.course_id}`);
                    }}
                    className="btn-secondary px-6 py-3"
                  >
                    Take Final Quiz →
                  </button>
                )}
              </div>
            </div>

            {/* Course Complete Alert */}
            {isCourseComplete && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-bold text-green-900 mb-2">🎉 Course Complete!</h3>
                <p className="text-green-800 mb-4">
                  Congratulations! You've completed all lessons. You can now take the final quiz to test your knowledge and earn your certificate.
                </p>
                <button
                  onClick={() => navigate(`/quiz/${enrollment.course_id}`)}
                  className="btn-primary"
                >
                  Take Final Quiz Now →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
