import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Clock, AlertCircle, BookOpen, FileText, Check, ChevronDown } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`);
        setCourse(response.data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-center text-slate-600">Loading course details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="card p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">Course not found</p>
            <Link to="/courses" className="btn-primary">
              Back to Courses
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/courses" className="text-gold-300 hover:text-gold-400 font-medium mb-6 inline-block text-sm uppercase tracking-wide">
            ← Back to Courses
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4">{course.title}</h1>
          <p className="text-lg text-navy-200 max-w-2xl">{course.description}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2">
            {/* Course Thumbnail */}
            <div className="mb-8 border border-slate-200 overflow-hidden">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Level & Meta */}
            <div className="mb-10">
              <div className={`inline-block px-4 py-2 rounded-sm text-sm font-semibold border mb-4 ${levelColors[course.level]}`}>
                {levelLabels[course.level]}
              </div>
              <div className="flex flex-wrap gap-6 text-slate-600 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-500" strokeWidth={1.5} />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold-500" strokeWidth={1.5} />
                  <span>{course.modules?.length || 0} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-500" strokeWidth={1.5} />
                  <span>{course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0} Lessons</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <p className="eyebrow mb-4">About This Course</p>
              <h2 className="text-2xl font-display font-semibold text-navy-900 mb-4">What you'll learn</h2>
              <p className="text-slate-700 leading-relaxed">
                {course.long_description || course.description}
              </p>
            </div>

            {/* Who This Course Is For */}
            <div className="mb-12 border-l-2 border-gold-300 pl-8 py-2">
              <h3 className="text-xl font-display font-semibold text-navy-900 mb-4">Who This Course Is For</h3>
              <ul className="space-y-3">
                {course.whoThisCourseIsFor?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-navy-600 mt-1 flex-shrink-0" strokeWidth={2} />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div className="mb-12">
              <p className="eyebrow mb-4">Curriculum</p>
              <h2 className="text-2xl font-display font-semibold text-navy-900 mb-6">Course modules</h2>
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {course.modules?.map((module, modIdx) => (
                  <details
                    key={module.id}
                    className="group py-5 cursor-pointer"
                  >
                    <summary className="flex items-center justify-between font-display font-semibold text-navy-900 list-none">
                      <span>{module.title}</span>
                      <ChevronDown className="w-5 h-5 text-gold-500 group-open:rotate-180 transition-transform flex-shrink-0" strokeWidth={1.5} />
                    </summary>
                    <div className="mt-4 space-y-2">
                      {module.lessons?.map((lesson, lesIdx) => (
                        <div
                          key={lesson.id}
                          className="flex items-start gap-3 py-2 text-slate-700"
                        >
                          <span className="text-slate-400 font-medium">
                            {lesIdx + 1}.
                          </span>
                          <span>{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="border-t border-slate-200 pt-8">
                <p className="eyebrow mb-4">Your Instructor</p>
                <div className="flex items-start gap-6">
                  <img
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0 border border-slate-200"
                  />
                  <div>
                    <p className="font-display font-semibold text-navy-900 text-lg">{course.instructor.name}</p>
                    <p className="text-gold-600 font-medium">{course.instructor.role}</p>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">{course.instructor.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="card p-8 sticky top-24">
              {/* Price */}
              <div className="mb-8">
                <p className="text-slate-500 text-sm uppercase tracking-wide mb-1">Course Price</p>
                <p className="text-4xl font-display font-semibold text-gold-500">
                  ₦{course.price.toLocaleString()}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                to={`/apply/${course.slug}`}
                className="btn-primary w-full text-center mb-4 text-lg"
              >
                Apply Now
              </Link>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-navy-600 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-slate-700">Self-paced learning</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-navy-600 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-slate-700">Certificate upon completion</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-navy-600 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-slate-700">Lifetime access to materials</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-navy-600 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-slate-700">Email support from instructors</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 border border-navy-200 bg-navy-50 rounded-md">
                <p className="text-xs text-navy-700">
                  <strong>Questions?</strong> Contact us at hello@antheracademy.com or use the contact form on our site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
