import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StatusAlert from '../components/StatusAlert';
import { CreditCard } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const token = authService.getToken();

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, offset]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/payments`,
        {
          params: { status: statusFilter, limit, offset },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayments(res.data.payments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    if (!window.confirm('Manually verify this payment?')) return;

    try {
      setVerifyingId(paymentId);
      await axios.put(
        `${API_BASE_URL}/api/admin/payments/${paymentId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Payment verified successfully');
      fetchPayments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setVerifyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading payments...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Payment Transactions</h1>
        <p className="text-slate-600 mb-8">View and manage Paystack transactions</p>

        {error && (
          <StatusAlert type="error" message={error} onClose={() => setError('')} />
        )}

        {success && (
          <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />
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
              <option value="">All Payments</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600">No payments found</p>
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-navy-900">
                            {payment.enrollments?.users?.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {payment.enrollments?.users?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {payment.enrollments?.courses?.title}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-navy-900">
                        ₦{(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">
                        {payment.reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handleVerifyPayment(payment.id)}
                            disabled={verifyingId === payment.id}
                            className="text-blue-500 hover:text-blue-700 font-medium disabled:opacity-50"
                          >
                            {verifyingId === payment.id ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                        {payment.status === 'success' && (
                          <span className="text-green-600 font-medium">✓ Verified</span>
                        )}
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
