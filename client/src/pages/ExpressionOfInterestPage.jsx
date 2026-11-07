import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export default function ExpressionOfInterestPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const [formData, setFormData] = useState({
    // Section 1: Your Details
    surname: '',
    first_name: '',
    email_address: '',
    phone_whatsapp_number: '',
    gender: '',
    state_of_residence: '',

    // Section 2: Your Background
    highest_qualification: '',
    field_of_study: '',
    institution_attended: '',
    year_completed: '',
    professional_status: '',
    nysc_status: '',
    work_experience: '',
    current_excel_level: '',

    // Section 3: Your Interest
    preferred_intake_month: '',
    areas_of_interest: [],
    how_heard: '',
    how_heard_other: '',

    // Section 4: Programme Commitment
    why_interested: '',
    can_attend_hybrid_training: false,
    can_complete_field_internship: '',
    internship_conditions: '',

    // Section 5: Consent
    consent_information_accurate: false,
    consent_data_storage: false,
    applicant_name: '',
    applicant_signature: '',
    signature_date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'areas_of_interest') {
        // Handle checkbox array
        setFormData(prev => {
          const currentAreas = prev.areas_of_interest || [];
          if (checked) {
            return { ...prev, areas_of_interest: [...currentAreas, value] };
          } else {
            return { ...prev, areas_of_interest: currentAreas.filter(item => item !== value) };
          }
        });
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Update word count for motivation
      if (name === 'why_interested') {
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
      }
    }
  };

  const validateForm = () => {
    const errors = [];

    // Section 1: Required fields
    if (!formData.surname) errors.push('Surname is required');
    if (!formData.first_name) errors.push('First name is required');
    if (!formData.email_address) errors.push('Email address is required');
    if (!formData.phone_whatsapp_number) errors.push('Phone/WhatsApp number is required');

    // Section 4: Motivation word count (30-100 words)
    if (!formData.why_interested) {
      errors.push('Please tell us why you are interested');
    } else {
      if (wordCount < 30) errors.push(`Motivation must be at least 30 words (currently ${wordCount} words)`);
      if (wordCount > 100) errors.push(`Motivation must not exceed 100 words (currently ${wordCount} words)`);
    }

    // Section 5: Consent required
    if (!formData.consent_information_accurate) errors.push('You must confirm the information is accurate');
    if (!formData.consent_data_storage) errors.push('You must consent to data storage');

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/eoi`, formData);
      
      setSuccess(true);
      window.scrollTo(0, 0);
      
      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      console.error('Error submitting EOI:', err);
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="card p-12 text-center bg-white">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              Expression of Interest Submitted!
            </h1>
            <p className="text-lg text-slate-600 mb-4">
              Thank you for your interest in ANTHER Academy, {formData.first_name}!
            </p>
            <p className="text-slate-600 mb-6">
              Our admissions team will review your expression of interest. If approved, you will receive an email notification with further instructions on how to proceed with your application and payment.
            </p>
            <p className="text-sm text-slate-500">
              Redirecting to homepage in 5 seconds...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            ANTHER ACADEMY
          </h1>
          <p className="text-xl text-slate-700 mb-1">
            Practical Accounting, Finance, Tax & Business Advisory Training Programme
          </p>
          <h2 className="text-2xl font-semibold text-gold-600 mb-4">
            EXPRESSION OF INTEREST FORM
          </h2>
          <p className="text-slate-600">
            <strong>5-Month Programme:</strong> 2 Months Hybrid In-House Training + 2 Months Field Internship + 
            Examination & Certification
          </p>
          <p className="text-sm text-slate-600 mt-4">
            <strong>How this works:</strong> Complete this short form first. Our admissions team will review it. If your 
            profile is suitable, we will email you the link to the full Application Form for Enrolment. Submitting this 
            form does not guarantee admission. Fields marked with * are required.
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Your Details */}
          <div className="card p-8 bg-white">
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Section 1: Your Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Surname *
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address *
                </label>
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone / WhatsApp number *
                </label>
                <input
                  type="tel"
                  name="phone_whatsapp_number"
                  value={formData.phone_whatsapp_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gender (optional)
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State of residence *
                </label>
                <select
                  name="state_of_residence"
                  value={formData.state_of_residence}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {NIGERIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Your Background */}
          <div className="card p-8 bg-white">
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Section 2: Your Background</h3>
            
            <p className="text-sm italic text-slate-600 mb-6">
              <strong>Entry requires at least an HND or BSc</strong> in Accounting, Finance, Economics, Business Administration or a related field 
              or active ICAN/ATSWA registration. <strong>Your Excel level</strong> helps us plan support for the early weeks. It does not affect your eligibility.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Highest qualification *
                </label>
                <select
                  name="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="ond">OND</option>
                  <option value="hnd">HND</option>
                  <option value="bsc_ba">BSc / BA</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="atswa_ican_only">ATSWA / ICAN only</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Field of study *
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Institution attended *
                </label>
                <input
                  type="text"
                  name="institution_attended"
                  value={formData.institution_attended}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year completed (or expected) *
                </label>
                <input
                  type="text"
                  name="year_completed"
                  value={formData.year_completed}
                  onChange={handleInputChange}
                  placeholder="e.g., 2023"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Professional status *
                </label>
                <select
                  name="professional_status"
                  value={formData.professional_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="not_registered">Not registered</option>
                  <option value="atswa_student">ATSWA student</option>
                  <option value="ican_professional_student">ICAN professional level student</option>
                  <option value="aca_aca_ana">ACA / ACA / ANA (newly qualified)</option>
                  <option value="other_certification">Other certification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  NYSC status *
                </label>
                <select
                  name="nysc_status"
                  value={formData.nysc_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="currently_serving">Currently serving</option>
                  <option value="completed_discharged">Completed (discharged)</option>
                  <option value="exempted">Exempted</option>
                  <option value="not_applicable">Not applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Work experience *
                </label>
                <select
                  name="work_experience"
                  value={formData.work_experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="none">None / yes</option>
                  <option value="under_1_year">Under 1 year</option>
                  <option value="1_to_2_years">1 to 2 years</option>
                  <option value="2_to_3_years">2 to 3 years</option>
                  <option value="more_than_3_years">More than 3 years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current MS Excel level *
                </label>
                <select
                  name="current_excel_level"
                  value={formData.current_excel_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="none">None</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Your Interest */}
          <div className="card p-8 bg-white">
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Section 3: Your Interest</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred intake *
                </label>
                <div className="flex gap-6">
                  {[
                    { value: 'march', label: 'March' },
                    { value: 'september', label: 'September' },
                    { value: 'not_sure', label: 'Not sure yet' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="preferred_intake_month"
                        value={option.value}
                        checked={formData.preferred_intake_month === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-navy-600"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Areas of interest (tick any)
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'practical_accounting_bookkeeping', label: 'Practical accounting and bookkeeping' },
                    { value: 'tax_compliance_advisory', label: 'Tax compliance and advisory' },
                    { value: 'finance_financial_analysis', label: 'Finance and financial analysis' },
                    { value: 'business_advisory', label: 'Business advisory' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="areas_of_interest"
                        value={option.value}
                        checked={formData.areas_of_interest.includes(option.value)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-navy-600"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How did you hear about ANTHER Academy? *
                </label>
                <select
                  name="how_heard"
                  value={formData.how_heard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="university_career_office">University career office</option>
                  <option value="nysc_orientation_camp">NYSC orientation camp</option>
                  <option value="ican_student_body">ICAN / student body</option>
                  <option value="social_media">Social media</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.how_heard === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Please specify
                  </label>
                  <input
                    type="text"
                    name="how_heard_other"
                    value={formData.how_heard_other}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Programme Commitment */}
          <div className="card p-8 bg-white">
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Section 4: Programme Commitment</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Why are you interested in the ANTHER Academy programme? * (30 to 100 words)
                </label>
                <textarea
                  name="why_interested"
                  value={formData.why_interested}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                ></textarea>
                <p className={`text-sm mt-1 ${
                  wordCount < 30 ? 'text-red-600' : 
                  wordCount > 100 ? 'text-red-600' : 
                  'text-slate-500'
                }`}>
                  Word count: {wordCount} / 30-100 words
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Can you attend the 2-month hybrid training (about 60% in-person, 40% online)? *
                </label>
                <div className="flex gap-6">
                  {[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' }
                  ].map(option => (
                    <label key={String(option.value)} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="can_attend_hybrid_training"
                        checked={formData.can_attend_hybrid_training === option.value}
                        onChange={() => setFormData(prev => ({ ...prev, can_attend_hybrid_training: option.value }))}
                        className="w-4 h-4 text-navy-600"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Can you complete the 2-month field internship, relocating if required? *
                </label>
                <div className="flex gap-6">
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'yes_with_conditions', label: 'Yes, with conditions' },
                    { value: 'no', label: 'No' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="can_complete_field_internship"
                        value={option.value}
                        checked={formData.can_complete_field_internship === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-navy-600"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.can_complete_field_internship === 'yes_with_conditions' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Conditions or scheduling conflicts (if any)
                  </label>
                  <textarea
                    name="internship_conditions"
                    value={formData.internship_conditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Consent */}
          <div className="card p-8 bg-white">
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Section 5: Consent</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consent_information_accurate"
                  checked={formData.consent_information_accurate}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-navy-600 mt-0.5"
                  required
                />
                <label className="text-sm text-slate-700">
                  I confirm that the information above is true and accurate. *
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consent_data_storage"
                  checked={formData.consent_data_storage}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-navy-600 mt-0.5"
                  required
                />
                <label className="text-sm text-slate-700">
                  I agree that ANTHER Academy may store and use my details to review my interest and contact me about admissions, 
                  in line with applicable data protection regulations. *
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="applicant_name"
                    value={formData.applicant_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Signature (type your name)
                  </label>
                  <input
                    type="text"
                    name="applicant_signature"
                    value={formData.applicant_signature}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date (DD / MM / YYYY)
                  </label>
                  <input
                    type="date"
                    name="signature_date"
                    value={formData.signature_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                <strong>Return this form to:</strong> [insert admissions email address]. Only candidates whose responses are 
                approved will receive the full application link.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Expression of Interest
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
