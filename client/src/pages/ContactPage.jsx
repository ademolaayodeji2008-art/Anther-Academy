import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Clock, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact`, formData);
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for reaching out! We\'ll get back to you soon.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@antheracademy.com',
      link: 'mailto:hello@antheracademy.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+234 (0) 123 456 789',
      link: 'tel:+234123456789',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Lagos, Nigeria',
      link: '#',
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: 'Within 24 hours',
      link: '#',
    },
  ];

  const faqItems = [
    {
      q: 'When do courses start?',
      a: 'Courses are self-paced, so you can start anytime after enrollment. You\'ll have lifetime access to materials.',
    },
    {
      q: 'Can I get a refund?',
      a: 'Yes. If you\'re unsatisfied within the first 7 days, we offer a full refund. No questions asked.',
    },
    {
      q: 'Do I need any prerequisites?',
      a: 'Prerequisites vary by course level. Check the course detail page to see if a course is right for your background.',
    },
    {
      q: 'Will this help with my ACA/ACCA/CIMA?',
      a: 'Our courses complement professional qualifications by strengthening practical skills. They\'re not direct exam prep, but invaluable for the work you\'ll do in the role.',
    },
    {
      q: 'Can I download course materials?',
      a: 'Yes. All lesson materials, slides, and case studies are downloadable for offline access.',
    },
    {
      q: 'Is there support during my course?',
      a: 'Absolutely. You can reach out to facilitators via email with questions. We also have a student community forum.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="eyebrow text-gold-300 mb-5">Contact</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4">Get in Touch</h1>
          <p className="text-lg text-navy-200 max-w-xl">
            Questions about courses? Want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {contactInfo.map((info, idx) => {
              const IconComponent = info.icon;
              return (
                <a
                  key={idx}
                  href={info.link}
                  className="p-6 md:pl-8 first:pl-0 text-center md:text-left group"
                >
                  <IconComponent className="w-6 h-6 text-gold-500 mb-3 mx-auto md:mx-0" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">{info.title}</p>
                  <p className="font-display font-semibold text-navy-900 group-hover:text-navy-600 transition">
                    {info.value}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <p className="eyebrow mb-4">Send a Message</p>
              <h2 className="text-3xl font-display font-semibold text-navy-900 mb-2">Let's talk</h2>
              <p className="text-slate-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              {submitStatus && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {submitStatus.message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="input-field"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="input-field"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="input-field"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows="6"
                    className="input-field"
                    required
                    disabled={isLoading}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-lg"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Info & Quick Links */}
          <div className="lg:col-span-1">
            {/* Contact Hours */}
            <div className="card p-8 mb-8">
              <h3 className="eyebrow mb-4">Response Times</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-slate-700">
                    <strong>Email:</strong> Within 24 hours
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-slate-700">
                    <strong>Phone:</strong> 9 AM - 5 PM WAT
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-slate-700">
                    <strong>Course Support:</strong> 48 hours
                  </span>
                </li>
              </ul>
            </div>

            {/* Why Contact Us */}
            <div className="card p-8 bg-navy-900 border-navy-900">
              <h3 className="eyebrow text-gold-300 mb-4">Common Reasons to Reach Out</h3>
              <ul className="space-y-3 text-sm text-navy-100">
                {[
                  'Questions about a specific course',
                  'Help choosing the right learning path',
                  'Technical issues or account help',
                  'Bulk enrollment for teams',
                  'Partnership opportunities',
                  'Facilitator inquiries',
                ].map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-gold-300 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">FAQ</p>
            <h2 className="text-4xl font-display font-semibold text-navy-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-200 border-y border-slate-200">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group py-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-display font-semibold text-navy-900 list-none">
                  <span>{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-gold-500 group-open:rotate-180 transition-transform flex-shrink-0" strokeWidth={1.5} />
                </summary>
                <div className="mt-4 text-slate-700 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 max-w-3xl mx-auto border-l-2 border-gold-300 pl-6 py-2">
            <p className="text-slate-700 mb-2">
              Can't find the answer you're looking for?
            </p>
            <p className="text-sm text-slate-500">
              Send us a message using the form above and we'll get back to you shortly.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
