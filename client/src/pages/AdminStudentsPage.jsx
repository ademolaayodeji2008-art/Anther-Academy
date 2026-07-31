import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StatusAlert from '../components/StatusAlert';
import AdminAttendanceMarker from '../components/AdminAttendanceMarker';
import { Users, BookOpen } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const token = authService.getToken();

  useEffect(() => {
    fetchStudents();
  }, [search, offset]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/students`,
        {
          params: { search, limit, offset },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(res.data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    try {
      setSelectedStudent(student);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/students/${student.id}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student details');
    }
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading students...</p>
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
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Student Management</h1>
        <p className="text-slate-600 mb-8">View and manage student accounts</p>

        {error && (
          <StatusAlert type="error" message={error} onClose={() => setError('')} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 border-b">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="divide-y max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition ${
                      selectedStudent?.id === student.id ? 'bg-navy-50' : ''
                    }`}
                  >
                    <p className="font-medium text-navy-900">{student.full_name}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Joined {new Date(student.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent && studentDetails ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-navy-900 mb-4">
                    {selectedStudent.full_name}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600">Email</p>
                      <p className="text-sm text-slate-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Joined</p>
                      <p className="text-sm text-slate-900">
                        {new Date(selectedStudent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enrollments & Attendance Marking */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-4">
                    Courses & Attendance ({studentDetails.enrollments.length})
                  </h3>

                  {studentDetails.enrollments.length === 0 ? (
                    <p className="text-slate-600">No enrollments yet</p>
                  ) : (
                    <div className="space-y-4">
                      {studentDetails.enrollments.map((enrollment) => {
                        const progress = studentDetails.progress[enrollment.course_id];
                        const progressPercent = progress
                          ? Math.round(
                              (progress.completed_lessons / progress.total_lessons) * 100
                            )
                          : 0;
                        const isExpanded = selectedCourse?.id === enrollment.course_id;

                        return (
                          <div key={enrollment.id} className="border border-slate-200 rounded-lg">
                            {/* Course Header */}
                            <button
                              onClick={() => setSelectedCourse(isExpanded ? null : enrollment)}
                              className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition text-left"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-navy-600" />
                                    <h4 className="font-medium text-navy-900">
                                      {enrollment.courses?.title}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    enrollment.status === 'active'
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-green-50 text-green-700'
                                  }`}
                                >
                                  {enrollment.status === 'active' ? 'In Progress' : 'Completed'}
                                </span>
                              </div>

                              {progress && (
                                <div className="mt-3">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="font-bold text-navy-600">
                                      {progressPercent}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                      className="bg-gold-400 h-2 rounded-full transition-all"
                                      style={{ width: `${progressPercent}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {progress.completed_lessons} of {progress.total_lessons}{' '}
                                    lessons marked
                                  </p>
                                </div>
                              )}
                            </button>

                            {/* Attendance Marking Section */}
                            {isExpanded && (
                              <div className="border-t border-slate-200 p-4 bg-white">
                                <h4 className="font-medium text-navy-900 mb-4">
                                  Mark Attendance & Completion
                                </h4>
                                <AdminAttendanceMarker
                                  studentId={selectedStudent.id}
                                  courseId={enrollment.course_id}
                                  token={token}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-slate-600">Select a student to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
