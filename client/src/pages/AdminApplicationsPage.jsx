import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, ChevronRight, Loader, Search } from 'lucide-react';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminApplicationsPage() {
  const navigate = useNavigate();
  const user = authService.getStoredUser();
  const token = authService.getToken();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== 'admin' || !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (courseFilter) params.append('course_id', courseFilter);
        params.append('limit', pagination.limit);
        params.append('offset', pagination.offset);

        const response = await axios.get(
          `${API_BASE_URL}/api/admin/applications?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setApplications(response.data.applications || []);
        setPagination(response.data.pagination || {});
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchApplications();
    }
  }, [user?.role, token, statusFilter, courseFilter, pagination.offset]);

  // Fetch courses for filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses`);
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  // Calculate summary counts
  const counts = {
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    admitted: applications.filter(a => a.status === 'admitted').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
    not_admitted: applications.filter(a => a.status === 'not_admitted').length,
  };

  const statusColors = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    admitted: 'bg-green-50 text-green-700 border-green-200',
    waitlisted: 'bg-amber-50 text-amber-700 border-amber-200',
    not_admitted: 'bg-red-50 text-red-700 border-red-200',
  };

  const handleRowClick = (appId) => {
    navigate(`/admin/applications/${appId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Programme Applications</h1>
          <p className="text-slate-600">Review and manage course applications from prospective students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Summary Counts */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <p className="text-3xl font-bold text-blue-600">{counts.submitted}</p>
            <p className="text-sm text-blue-700 font-medium">Submitted</p>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-amber-50 to-amber-100">
            <p className="text-3xl font-bold text-amber-600">{counts.under_review}</p>
            <p className="text-sm text-amber-700 font-medium">Under Review</p>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
            <p className="text-3xl font-bold text-green-600">{counts.admitted}</p>
            <p className="text-sm text-green-700 font-medium">Admitted</p>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
            <p className="text-3xl font-bold text-purple-600">{counts.waitlisted}</p>
            <p className="text-sm text-purple-700 font-medium">Waitlisted</p>
          </div>
          <div className="card p-4 text-center bg-gradient-to-br from-red-50 to-red-100">
            <p className="text-3xl font-bold text-red-600">{counts.not_admitted}</p>
            <p className="text-sm text-red-700 font-medium">Not Admitted</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, offset: 0 }));
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="admitted">Admitted</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="not_admitted">Not Admitted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPagination(prev => ({ ...prev, offset: 0 }));
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Results Per Page</label>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), offset: 0 }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card bg-white overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 text-navy-600 mx-auto animate-spin mb-3" />
              <p className="text-slate-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 mb-4">No applications found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Reference</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Applicant</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Submitted</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Scores</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-navy-600 font-medium">
                          {app.application_id_ref}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-slate-900">
                            {app.first_name} {app.surname}
                          </div>
                          <div className="text-xs text-slate-500">{app.email_address}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {app.courses?.title || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[app.status]}`}>
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {app.aptitude_test_score || app.interview_score ? (
                            <div className="text-slate-700">
                              {app.aptitude_test_score && <div>A: {app.aptitude_test_score}/100</div>}
                              {app.interview_score && <div>I: {app.interview_score}/100</div>}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleRowClick(app.id)}
                            className="inline-flex items-center gap-1 text-navy-600 hover:text-navy-700 font-medium"
                          >
                            View
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                      disabled={pagination.offset === 0}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                      disabled={pagination.offset + pagination.limit >= pagination.total}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
