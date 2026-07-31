import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CourseThumbnail from '../components/CourseThumbnail';
import {
  BookOpen,
  Briefcase,
  Award,
  TrendingUp,
  CheckCircle,
  Users,
  Clock
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses?limit=3`);
        setFeaturedCourses(response.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setFeaturedCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  const stats = [
    { label: 'Students Trained', value: '2,500+' },
    { label: 'Course Pass Rate', value: '94%' },
    { label: 'Certified Facilitators', value: '15+' },
    { label: 'Active Courses', value: '12' },
  ];

  const whyChooseUs = [
    {
      icon: BookOpen,
      title: 'Practice-Based Learning',
      description: 'Not just theory. Real-world scenarios, case studies, and hands-on exercises that mirror daily accounting practice.',
    },
    {
      icon: Briefcase,
      title: 'Taught by Practicing Professionals',
      description: 'Learn from certified accountants with active experience in public practice, corporate finance, and tax.',
    },
    {
      icon: Award,
      title: 'Works Alongside Your Qualifications',
      description: 'Perfect complement to ACA, ACCA, CIMA, and other accounting certifications. Sharpen practical skills.',
    },
    {
      icon: TrendingUp,
      title: 'Flexible, Self-Paced Learning',
      description: 'Balance training with your current job. Learn on your schedule without sacrificing career momentum.',
    },
    {
      icon: CheckCircle,
      title: 'Industry-Recognized Certificates',
      description: 'Upon completion, earn certificates that strengthen your CV and professional profile.',
    },
    {
      icon: Users,
      title: 'Community of Accountants',
      description: 'Connect with peers across different levels and specializations. Share insights. Build networks.',
    },
  ];

  const testimonials = [
    {
      name: 'Chioma Adeyemi',
      role: 'Senior Accountant, Big4 Firm',
      quote: 'The practical focus helped me think differently about complex audit scenarios. Finally, theory meets real work.',
      level: 'Practicing Accountant',
    },
    {
      name: 'Emeka Okonkwo',
      role: 'Fresh Graduate, Finance Analyst',
      quote: 'This gave me the confidence to handle actual transactions on day one. Best investment in my career start.',
      level: 'New to Practice',
    },
    {
      name: 'Ama Mensah',
      role: 'Chartered Accountant (ACA)',
      quote: 'Even with years of experience, the advanced modules sharpened my approach to strategic financial planning.',
      level: 'Chartered/Advanced',
    },
  ];

  const levelLabels = {
    new_to_practice: 'New to Practice',
    practicing_accountant: 'Practicing Accountant',
    chartered_advanced: 'Chartered/Advanced',
  };

  const levelColors = {
    new_to_practice: 'bg-green-50 text-green-700 border-green-200',
    practicing_accountant: 'bg-blue-50 text-blue-700 border-blue-200',
    chartered_advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-16 items-end">
            <div className="md:col-span-3">
              <p className="eyebrow text-gold-300 mb-6">Professional Accounting Training</p>
              <h1 className="text-5xl md:text-6xl font-display font-semibold leading-[1.1] mb-8 text-white">
                Practical training for every stage of an accounting career
              </h1>
              <p className="text-xl text-navy-200 mb-10 leading-relaxed max-w-xl">
                From fresh graduates to chartered accountants—master on-the-job accounting skills that matter. Taught by practicing professionals. Real scenarios, real results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-primary bg-gold-300 text-navy-900 hover:bg-gold-400 text-center"
                >
                  Enroll Now
                </Link>
                <Link
                  to="/courses"
                  className="btn-outline border-white/40 text-white hover:bg-white hover:text-navy-900 text-center"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:col-span-2">
              <div className="border-l border-white/20 pl-10 space-y-8">
                {stats.slice(0, 2).map((stat, idx) => (
                  <div key={idx}>
                    <p className="text-5xl font-display font-semibold text-gold-300 mb-1">{stat.value}</p>
                    <p className="text-sm uppercase tracking-widest text-navy-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center py-10 px-4">
                <p className="text-3xl md:text-4xl font-display font-semibold text-navy-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">Why Anther Academy</p>
            <h2 className="text-4xl font-display font-semibold text-navy-900 mb-4">Built by accountants, for accountants</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Here's what sets our training apart from a standard course.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-slate-200">
            {whyChooseUs.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 border-b border-r border-slate-200"
                >
                  <p className="font-display text-3xl text-gold-300 mb-4">{String(idx + 1).padStart(2, '0')}</p>
                  <IconComponent className="w-6 h-6 text-navy-600 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-display font-semibold text-navy-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-4">Featured Courses</p>
              <h2 className="text-4xl font-display font-semibold text-navy-900 mb-2">Start your learning journey</h2>
              <p className="text-slate-600">These are the courses professionals return to most</p>
            </div>
            <Link
              to="/courses"
              className="hidden sm:inline text-navy-600 hover:text-navy-900 font-medium text-sm uppercase tracking-wide"
            >
              View All Courses →
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="card overflow-hidden group"
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
                    <div className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold border mb-3 ${levelColors[course.level] || levelColors.new_to_practice}`}>
                      {levelLabels[course.level] || 'Course'}
                    </div>

                    <h3 className="text-lg font-display font-semibold text-navy-900 mb-2 group-hover:text-navy-600 transition">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" strokeWidth={1.5} />
                        <span>{course.duration_weeks} weeks</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-2xl font-display font-semibold text-gold-500">
                        ₦{course.price.toLocaleString()}
                      </span>
                      <span className="text-navy-600 font-medium text-sm uppercase tracking-wide">Learn →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              to="/courses"
              className="btn-primary px-8 py-3"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">What Our Students Say</p>
            <h2 className="text-4xl font-display font-semibold text-navy-900 mb-4">Hear from the practice</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Graduates who've elevated their accounting practice with Anther Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-t border-slate-200">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="flex flex-col p-8 first:pl-0 md:first:pl-0"
              >
                <p className="font-display text-4xl text-gold-300 mb-4 leading-none">"</p>

                <p className="text-slate-700 mb-8 flex-grow leading-relaxed">
                  {testimonial.quote}
                </p>

                <div className="pt-4 border-t border-slate-200">
                  <p className="font-display font-semibold text-navy-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-xs text-gold-600 font-medium mt-1 uppercase tracking-wide">
                    {testimonial.level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="eyebrow text-gold-300 mb-6 justify-center flex">Get Started</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6">
            Ready to sharpen your accounting skills?
          </h2>
          <p className="text-lg text-navy-200 mb-10 max-w-2xl mx-auto">
            Join accountants from every level who are advancing their practice with Anther Academy.
          </p>
          <Link
            to="/register"
            className="btn-primary bg-gold-300 text-navy-900 hover:bg-gold-400 inline-block"
          >
            Enroll Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
