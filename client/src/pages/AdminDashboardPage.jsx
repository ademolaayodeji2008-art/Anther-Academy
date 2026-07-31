import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  CreditCard, 
  ClipboardList,
  AlertCircle,
  FileText
} from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const user = authService.getStoredUser();
  const token = authService.getToken();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Create a timeout promise (10 seconds)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
        );

        // Race between actual request and timeout
        const res = await Promise.race([
          axios.get(
            `${API_BASE_URL}/api/admin/overview`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          timeoutPromise,
        ]);

        setOverview(res.data.overview);
      } catch (err) {
        console.error('Error fetching overview:', err);
        
        // Show specific error messages based on error type
        let errorMessage = 'Failed to load dashboard';
        
        if (err.message?.includes('timed out')) {
          errorMessage = 'Dashboard request timed out — the server is taking too long to respond. Please check your connection and try again.';
        } else if (err.response?.status === 504) {
          errorMessage = 'Dashboard request timed out — please try again in a moment.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Connection timeout — server is not responding.';
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin' && token) {
      fetchOverview();
    } else {
      setError('Admin access required');
      setIsLoading(false);
    }
  }, [user?.id, token]); // Use primitive values instead of object

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <p className="text-slate-600">You must be an admin to access this page.</p>
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
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage courses, students, payments, and analytics</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'enrollments', label: 'Enrollments', icon: ClipboardList },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-4 font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-navy-500 text-navy-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 bg-gradient-to-br from-navy-50 to-blue-50">
                <div className="text-sm font-medium text-slate-600 mb-2">Total Students</div>
                <div className="text-4xl font-bold text-navy-900 mb-2">
                  {overview.total_students}
                </div>
                <p className="text-xs text-slate-500">Active learners</p>
              </div>

              <div className="card p-6 bg-gradient-to-br from-gold-50 to-amber-50">
                <div className="text-sm font-medium text-slate-600 mb-2">Active Enrollments</div>
                <div className="text-4xl font-bold text-navy-900 mb-2">
                  {overview.active_enrollments}
                </div>
                <p className="text-xs text-slate-500">In progress courses</p>
              </div>

              <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-sm font-medium text-slate-600 mb-2">Completion Rate</div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {overview.completion_rate}%
                </div>
                <p className="text-xs text-slate-500">Completed courses</p>
              </div>

              <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-sm font-medium text-slate-600 mb-2">Total Revenue</div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  ₦{(overview.total_revenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">From successful payments</p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="text-sm font-medium text-slate-600 mb-2">Total Courses</div>
                <div className="text-3xl font-bold text-navy-900">{overview.total_courses}</div>
              </div>

              <div className="card p-6">
                <div className="text-sm font-medium text-slate-600 mb-2">Certificates Issued</div>
                <div className="text-3xl font-bold text-navy-900">{overview.total_certificates}</div>
              </div>

              <div className="card p-6">
                <div className="text-sm font-medium text-slate-600 mb-2">Completed Enrollments</div>
                <div className="text-3xl font-bold text-navy-900">
                  {overview.completed_enrollments}
                </div>
              </div>

              <div className="card p-6">
                <div className="text-sm font-medium text-slate-600 mb-2">Pending Payments</div>
                <div className="text-3xl font-bold text-orange-600">{overview.pending_payments}</div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900">Programme Applications</h2>
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">Review and manage course applications from prospective students</p>
              <Link to="/admin/applications" className="btn-primary">
                Manage Applications →
              </Link>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">Course Management</h2>
              <Link to="/admin/courses" className="btn-primary">
                + New Course
              </Link>
            </div>
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">
                Use the dedicated course management page for full CRUD operations
              </p>
              <Link to="/admin/courses" className="btn-primary">
                Go to Course Manager →
              </Link>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900">Student Management</h2>
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">View and manage student accounts and progress</p>
              <Link to="/admin/students" className="btn-primary">
                Manage Students →
              </Link>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900">Payment Transactions</h2>
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">
                View Paystack transactions and verify payments in edge cases
              </p>
              <Link to="/admin/payments" className="btn-primary">
                View Payment Log →
              </Link>
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900">Enrollment Management</h2>
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">Monitor all student enrollments and their status</p>
              <Link to="/admin/enrollments" className="btn-primary">
                View Enrollments →
              </Link>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Link to="/admin/applications" className="card p-6 hover:shadow-lg transition">
            <FileText className="w-8 h-8 text-gold-400 mb-3" />
            <h3 className="font-bold text-navy-900 mb-2">Applications</h3>
            <p className="text-sm text-slate-600">Review course applications</p>
          </Link>

          <Link to="/admin/courses" className="card p-6 hover:shadow-lg transition">
            <BookOpen className="w-8 h-8 text-gold-400 mb-3" />
            <h3 className="font-bold text-navy-900 mb-2">Courses</h3>
            <p className="text-sm text-slate-600">Create and manage courses</p>
          </Link>

          <Link to="/admin/students" className="card p-6 hover:shadow-lg transition">
            <Users className="w-8 h-8 text-gold-400 mb-3" />
            <h3 className="font-bold text-navy-900 mb-2">Students</h3>
            <p className="text-sm text-slate-600">View student profiles</p>
          </Link>

          <Link to="/admin/payments" className="card p-6 hover:shadow-lg transition">
            <CreditCard className="w-8 h-8 text-gold-400 mb-3" />
            <h3 className="font-bold text-navy-900 mb-2">Payments</h3>
            <p className="text-sm text-slate-600">Manage transactions</p>
          </Link>

          <Link to="/admin/enrollments" className="card p-6 hover:shadow-lg transition">
            <ClipboardList className="w-8 h-8 text-gold-400 mb-3" />
            <h3 className="font-bold text-navy-900 mb-2">Enrollments</h3>
            <p className="text-sm text-slate-600">Track student progress</p>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
