import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Search, Filter, UserCheck, UserX, Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminEOIPage() {
  const navigate = useNavigate();
  const [eois, setEOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEOI, setSelectedEOI] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'admit' or 'reject'
  const [admissionNotes, setAdmissionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEOIs();
  }, [filterStatus]);

  const fetchEOIs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = filterStatus ? { admission_status: filterStatus } : {};
      
      const response = await axios.get(`${API_BASE_URL}/api/eoi`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      setEOIs(response.data.eois || []);
    } catch (err) {
      console.error('Error fetching EOIs:', err);
      setError(err.response?.data?.message || 'Failed to load expressions of interest');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEOI = async (eoiId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/eoi/${eoiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSelectedEOI(response.data.eoi);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching EOI details:', err);
      alert(err.response?.data?.message || 'Failed to load EOI details');
    }
  };

  const handleAdmit = async () => {
    if (!admissionNotes.trim()) {
      alert('Please provide admission notes');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/eoi/${selectedEOI.id}/admit`,
        { admission_notes: admissionNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Admission granted successfully! Email sent to applicant.');
      setShowModal(false);
      setSelectedEOI(null);
      setAdmissionNotes('');
      fetchEOIs();
    } catch (err) {
      console.error('Error granting admission:', err);
      alert(err.response?.data?.message || 'Failed to grant admission');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!admissionNotes.trim()) {
      alert('Please provide rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/eoi/${selectedEOI.id}/reject`,
        { admission_notes: admissionNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('EOI rejected.');
      setShowModal(false);
      setSelectedEOI(null);
      setAdmissionNotes('');
      fetchEOIs();
    } catch (err) {
      console.error('Error rejecting EOI:', err);
      alert(err.response?.data?.message || 'Failed to reject EOI');
    } finally {
      setProcessing(false);
    }
  };

  const filteredEOIs = eois.filter(eoi => {
    const matchesSearch = 
      eoi.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eoi.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eoi.email_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      admitted: 'bg-green-100 text-green-800 border-green-200',
      not_admitted: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      admitted: <CheckCircle className="w-4 h-4" />,
      not_admitted: <XCircle className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status]}
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Expression of Interest</h1>
          <p className="text-slate-600">Review and manage programme applications</p>
        </div>

        {/* Filters */}
        <div className="card p-6 bg-white mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="admitted">Admitted</option>
                <option value="not_admitted">Not Admitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* EOI List */}
        {loading ? (
          <div className="card p-12 bg-white text-center">
            <p className="text-slate-600">Loading expressions of interest...</p>
          </div>
        ) : filteredEOIs.length === 0 ? (
          <div className="card p-12 bg-white text-center">
            <p className="text-slate-600">No expressions of interest found</p>
          </div>
        ) : (
          <div className="card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Qualification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Intake</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEOIs.map((eoi) => (
                    <tr key={eoi.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-navy-900">
                          {eoi.first_name} {eoi.surname}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {eoi.email_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {eoi.highest_qualification || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {eoi.preferred_intake_month?.replace('_', ' ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(eoi.admission_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(eoi.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewEOI(eoi.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-navy-600 hover:text-navy-800 hover:bg-navy-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* EOI Detail Modal */}
      {showModal && selectedEOI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                {selectedEOI.first_name} {selectedEOI.surname}
              </h2>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedEOI.admission_status)}
                <span className="text-sm text-slate-500">
                  Submitted {new Date(selectedEOI.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Section 1: Personal Details */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-3">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium">{selectedEOI.email_address}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <p className="font-medium">{selectedEOI.phone_whatsapp_number}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Gender:</span>
                    <p className="font-medium">{selectedEOI.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">State:</span>
                    <p className="font-medium">{selectedEOI.state_of_residence || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Background */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-3">Background</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Highest Qualification:</span>
                    <p className="font-medium">{selectedEOI.highest_qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Field of Study:</span>
                    <p className="font-medium">{selectedEOI.field_of_study || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Institution:</span>
                    <p className="font-medium">{selectedEOI.institution_attended || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Year Completed:</span>
                    <p className="font-medium">{selectedEOI.year_completed || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Professional Status:</span>
                    <p className="font-medium">{selectedEOI.professional_status || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">NYSC Status:</span>
                    <p className="font-medium">{selectedEOI.nysc_status || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Work Experience:</span>
                    <p className="font-medium">{selectedEOI.work_experience?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Excel Level:</span>
                    <p className="font-medium">{selectedEOI.current_excel_level || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Interest */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-3">Programme Interest</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-500">Preferred Intake:</span>
                    <p className="font-medium">{selectedEOI.preferred_intake_month?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Areas of Interest:</span>
                    <p className="font-medium">
                      {selectedEOI.areas_of_interest && selectedEOI.areas_of_interest.length > 0
                        ? selectedEOI.areas_of_interest.map(a => a.replace(/_/g, ' ')).join(', ')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">How They Heard About Us:</span>
                    <p className="font-medium">{selectedEOI.how_heard?.replace('_', ' ') || 'N/A'}</p>
                    {selectedEOI.how_heard_other && (
                      <p className="text-slate-600 mt-1">{selectedEOI.how_heard_other}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Motivation */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-3">Why Interested</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedEOI.why_interested || 'N/A'}</p>
              </div>

              {/* Section 5: Commitment */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-3">Programme Commitment</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Can attend hybrid training:</span>
                    <p className="font-medium">{selectedEOI.can_attend_hybrid_training ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Can complete field internship:</span>
                    <p className="font-medium">{selectedEOI.can_complete_field_internship || 'N/A'}</p>
                  </div>
                  {selectedEOI.internship_conditions && (
                    <div>
                      <span className="text-slate-500">Internship conditions:</span>
                      <p className="font-medium">{selectedEOI.internship_conditions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Notes */}
              {selectedEOI.admission_notes && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">Admin Notes</h3>
                  <p className="text-sm text-slate-700">{selectedEOI.admission_notes}</p>
                </div>
              )}

              {/* Action Section */}
              {selectedEOI.admission_status === 'pending' && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-navy-900 mb-3">Decision</h3>
                  <textarea
                    value={admissionNotes}
                    onChange={(e) => setAdmissionNotes(e.target.value)}
                    placeholder="Enter admission notes or rejection reason..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent mb-4"
                  />
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleAdmit}
                      disabled={processing}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
                    >
                      <UserCheck className="w-5 h-5" />
                      Grant Admission
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
                    >
                      <UserX className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedEOI(null);
                  setAdmissionNotes('');
                }}
                className="w-full px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
