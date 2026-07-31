import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminAttendanceMarker({ studentId, courseId, token }) {
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [markingLessonId, setMarkingLessonId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('attended');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceData();
  }, [studentId, courseId]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/attendance/student/${studentId}/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModules(res.data.modules);
      // Expand first module by default
      if (res.data.modules?.length > 0) {
        setExpandedModules({ [res.data.modules[0].id]: true });
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleMarkAttendance = async (lessonId) => {
    try {
      setError('');
      setSuccess('');

      await axios.post(
        `${API_BASE_URL}/api/admin/attendance/mark`,
        {
          studentId,
          lessonId,
          courseId,
          attendanceStatus: selectedStatus,
          attendanceDate: selectedDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Marked as ${selectedStatus}`);
      setMarkingLessonId(null);
      
      // Refresh data
      await fetchAttendanceData();

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'attended':
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'excused':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'attended':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'excused':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="text-slate-600 text-center">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {success}
        </div>
      )}

      <div className="space-y-2">
        {modules.length === 0 ? (
          <p className="text-slate-600 text-center py-4">No modules found for this course</p>
        ) : (
          modules.map(module => (
            <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Module Header */}
              <button
                onClick={() => handleToggleModule(module.id)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3 flex-grow text-left">
                  {expandedModules[module.id] ? (
                    <ChevronUp className="w-5 h-5 text-navy-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-navy-600" />
                  )}
                  <h4 className="font-medium text-navy-900">{module.title}</h4>
                  <span className="ml-auto text-xs text-slate-500">
                    {module.lessons?.length || 0} lessons
                  </span>
                </div>
              </button>

              {/* Lessons List */}
              {expandedModules[module.id] && (
                <div className="divide-y">
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map(lesson => {
                      const attendance = lesson.attendance;
                      const isMarking = markingLessonId === lesson.id;

                      return (
                        <div key={lesson.id} className="p-4">
                          {isMarking ? (
                            // Marking Form
                            <div className="space-y-3">
                              <p className="font-medium text-navy-900">{lesson.title}</p>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-slate-600 block mb-1">
                                    Status
                                  </label>
                                  <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="input-field w-full text-sm"
                                  >
                                    <option value="attended">Attended</option>
                                    <option value="completed">Completed</option>
                                    <option value="absent">Absent</option>
                                    <option value="excused">Excused</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-slate-600 block mb-1">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="input-field w-full text-sm"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMarkAttendance(lesson.id)}
                                  className="btn-primary flex-1 py-2 text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setMarkingLessonId(null)}
                                  className="btn-outline flex-1 py-2 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display View
                            <div className="flex items-center justify-between">
                              <div className="flex-grow">
                                <p className="font-medium text-navy-900">{lesson.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{lesson.content_type}</p>
                              </div>

                              {attendance ? (
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(attendance.attendance_status)}`}>
                                    {getStatusIcon(attendance.attendance_status)}
                                    <span className="capitalize">{attendance.attendance_status}</span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {attendance.attendance_date}
                                  </span>
                                  <button
                                    onClick={() => setMarkingLessonId(lesson.id)}
                                    className="px-3 py-1 text-xs font-medium text-navy-600 hover:text-navy-900 transition"
                                  >
                                    Edit
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setMarkingLessonId(lesson.id)}
                                  className="px-4 py-2 text-sm font-medium text-gold-600 hover:text-gold-900 border border-gold-200 rounded hover:bg-gold-50 transition"
                                >
                                  + Mark Attendance
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-600 text-sm">
                      No lessons in this module
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
