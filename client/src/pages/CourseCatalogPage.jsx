import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CourseThumbnail from '../components/CourseThumbnail';
import PageHero from '../components/PageHero';
import FadeIn from '../components/FadeIn';
import { BookOpen, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CourseCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses from:', `${API_BASE_URL}/api/courses`);
        const response = await axios.get(`${API_BASE_URL}/api/courses`);
        console.log('Courses fetched successfully:', response.data);
        setCourses(response.data.courses || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        console.error('API URL:', `${API_BASE_URL}/api/courses`);
        setCourses([]);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    // Filter by level
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by published status
    filtered = filtered.filter(course => course.is_published !== false); // Show published OR if is_published is null/undefined

    setFilteredCourses(filtered);

    // Update URL params
    if (selectedLevel) {
      setSearchParams({ level: selectedLevel });
    } else {
      setSearchParams({});
    }
  }, [selectedLevel, searchQuery, courses, setSearchParams]);

  const levelOptions = [
    { value: '', label: 'All Courses' },
    { value: 'new_to_practice', label: 'New to Practice' },
    { value: 'practicing_accountant', label: 'Practicing Accountant' },
    { value: 'chartered_advanced', label: 'Chartered/Advanced' },
  ];

  const levelColors = {
    new_to_practice: 'bg-green-50 text-green-700 border-green-200',
    practicing_accountant: 'bg-blue-50 text-blue-700 border-blue-200',
    chartered_advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const levelLabels = {
    new_to_practice: 'New to Practice',
    practicing_accountant: 'Practicing Accountant',
    chartered_advanced: 'Chartered/Advanced',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <PageHero
        image="/images/hero-courses.jpg"
        eyebrow="Courses"
        title="Browse All Courses"
        subtitle="Practical accounting training for every professional level"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="eyebrow mb-6">Filter Courses</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Course name..."
                  className="input-field text-sm"
                />
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Professional Level
                </label>
                <div className="space-y-2">
                  {levelOptions.map(option => (
                    <label 
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition"
                    >
                      <input
                        type="radio"
                        name="level"
                        value={option.value}
                        checked={selectedLevel === option.value}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-4 h-4 text-navy-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedLevel || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedLevel('');
                    setSearchQuery('');
                  }}
                  className="w-full mt-6 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Content - Course Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-navy-900">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
              </h2>
              {selectedLevel && (
                <p className="text-slate-600 text-sm">
                  Showing: {levelLabels[selectedLevel]}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="card p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">No courses found</p>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedLevel('');
                    setSearchQuery('');
                  }}
                  className="btn-primary"
                >
                  View All Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredCourses.map((course, idx) => (
                  <FadeIn key={course.id} delay={(idx % 4) * 0.08}>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="card overflow-hidden group block"
                    >
                      {/* Thumbnail */}
                      <div className="h-48 bg-slate-200 overflow-hidden">
                        <CourseThumbnail
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold border mb-3 ${levelColors[course.level]}`}>
                          {levelLabels[course.level]}
                        </div>

                        <h3 className="text-lg font-display font-semibold text-navy-900 mb-2 group-hover:text-navy-600 transition line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            <span>{course.duration_weeks} weeks</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <span className="text-xl font-display font-semibold text-gold-500">
                            ₦{course.price.toLocaleString()}
                          </span>
                          <span className="text-navy-600 font-medium text-sm uppercase tracking-wide">View →</span>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
