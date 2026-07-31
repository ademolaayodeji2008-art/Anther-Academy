import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StatusAlert from '../components/StatusAlert';
import { ClipboardList } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const token = authService.getToken();

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter, offset]);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/enrollments`,
        {
          params: { status: statusFilter, limit, offset },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEnrollments(res.data.enrollments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading enrollments...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 text-blue-700';
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'pending_payment':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Enrollment Management</h1>
        <p className="text-slate-600 mb-8">Track all student enrollments and their status</p>

        {error && (
          <StatusAlert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-navy-900">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setOffset(0);
              }}
              className="input-field"
            >
              <option value="">All Enrollments</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending_payment">Pending Payment</option>
            </select>
          </div>
        </div>

        {/* Enrollments Table */}
        {enrollments.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600">No enrollments found</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-navy-900">
                            {enrollment.users?.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {enrollment.users?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {enrollment.courses?.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status
                            ? enrollment.status
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')
                            : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {enrollment.completed_at
                          ? new Date(enrollment.completed_at).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            className="btn-outline"
          >
            Next
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
