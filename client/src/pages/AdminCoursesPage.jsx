import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StatusAlert from '../components/StatusAlert';
import { BookOpen } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    duration_weeks: '4',
    thumbnail_url: '',
    level: 'new_to_practice',
    is_published: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const token = authService.getToken();
  const user = authService.getStoredUser();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(res.data.courses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let thumbnailUrl = formData.thumbnail_url;

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', imageFile);

        try {
          const uploadRes = await axios.post(
            `${API_BASE_URL}/api/upload`,
            uploadData,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}` 
              } 
            }
          );
          thumbnailUrl = uploadRes.data.url;
        } catch (uploadErr) {
          setError('Failed to upload image');
          setIsUploading(false);
          return;
        }
      }

      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/api/admin/courses/${editingId}`,
          { ...formData, thumbnail_url: thumbnailUrl, duration_weeks: parseInt(formData.duration_weeks) || 4 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Course updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/courses`,
          { ...formData, thumbnail_url: thumbnailUrl, duration_weeks: parseInt(formData.duration_weeks) || 4 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Course created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setImageFile(null);
      setFormData({ title: '', slug: '', description: '', price: '', duration_weeks: '4', thumbnail_url: '', level: 'new_to_practice', is_published: false });
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Course deleted successfully');
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      price: course.price.toString(),
      duration_weeks: (course.duration_weeks || 4).toString(),
      thumbnail_url: course.thumbnail_url || '',
      level: course.level,
      is_published: course.is_published || false,
    });
    setImageFile(null);
    setEditingId(course.id);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading courses...</p>
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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-2">Course Management</h1>
            <p className="text-slate-600">Create, edit, and manage courses</p>
          </div>
          <button
            onClick={() => {
              setFormData({ title: '', slug: '', description: '', price: '', duration_weeks: '4', thumbnail_url: '', level: 'new_to_practice', is_published: false });
              setImageFile(null);
              setEditingId(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + New Course
          </button>
        </div>

        {error && (
          <StatusAlert type="error" message={error} onClose={() => setError('')} />
        )}

        {success && (
          <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                {editingId ? 'Edit Course' : 'Create New Course'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="input-field w-full"
                      placeholder="course-title"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    Course Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="input-field w-full"
                  />
                  {formData.thumbnail_url && !imageFile && (
                    <p className="text-xs text-slate-600 mt-2">Current: {formData.thumbnail_url.substring(0, 50)}...</p>
                  )}
                  {imageFile && (
                    <p className="text-xs text-green-600 mt-2">✓ New image selected: {imageFile.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-2">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duration_weeks}
                      onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                      className="input-field w-full"
                      placeholder="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-2">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="new_to_practice">New to Practice</option>
                      <option value="practicing_accountant">Practicing Accountant</option>
                      <option value="chartered_advanced">Chartered/Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4 mr-2"
                    />
                    Published
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update Course' : 'Create Course'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courses Table */}
        {courses.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600 mb-4">No courses yet. Create your first course!</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-navy-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                        {course.level}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        ₦{course.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.is_published
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-navy-500 hover:text-navy-700 font-medium"
                        >
                          Edit
                        </button>
                        <Link
                          to={`/admin/courses/${course.id}/modules`}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Modules
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
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

      <Footer />
    </div>
  );
}
