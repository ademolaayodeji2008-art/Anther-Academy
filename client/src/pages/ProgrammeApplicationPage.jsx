import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ChevronRight, ChevronLeft, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import {
  Step1CourseBackground,
  Step2Personal,
  Step3Qualifications,
  Step4Professional,
  Step5NYSC,
  Step6WorkExperience,
  Step7Software,
  Step8Motivation,
  Step9Commitment,
  Step10Referee,
  Step11Payment,
  Step12Declaration,
  Step13Documents,
  Step14Review,
  StepSuccess,
} from '../components/ApplicationFormSteps';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ProgrammeApplicationPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [applicationRef, setApplicationRef] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Course + How heard
    how_heard: '',
    how_heard_other: '',
    passport_photo: null,
    passport_photo_file: null,

    // Step 2: Personal
    surname: '',
    first_name: '',
    other_names: '',
    gender: '',
    date_of_birth: '',
    nationality: '',
    state_of_origin: '',
    state_of_residence: '',
    phone_numbers: '',
    email_address: '',
    residential_address: '',
    next_of_kin_name: '',
    next_of_kin_relationship: '',
    next_of_kin_phone: '',

    // Step 3: Qualifications
    qualifications: [{ institution: '', qualification: '', field_of_study: '', class_grade: '', year_completed: '' }],

    // Step 4: Professional Status
    professional_status: '',
    membership_reg_number: '',
    date_registered: '',
    other_professional_certifications: '',

    // Step 5: NYSC Status
    nysc_status: '',
    call_up_number: '',
    state_of_deployment_ppa: '',
    batch_stream: '',
    discharge_date: '',

    // Step 6: Work Experience
    work_experience: [{ organisation: '', role_title: '', duration: '', duties: '' }],

    // Step 7: Software Skills
    skill_ratings: {
      ms_excel: '',
      ms_word_powerpoint: '',
      accounting_software: '',
      accounting_software_specify: '',
      power_bi_google_data_studio: '',
      internet_email_research: '',
    },

    // Step 8: Motivation
    motivation_why_enrol: '',
    motivation_learning_experience: '',

    // Step 9: Commitment
    can_attend_hybrid_training: false,
    can_undertake_internship: '',
    internship_conditions_notes: '',
    preferred_internship_location: '',
    known_scheduling_conflicts: '',

    // Step 10: Referee
    referee_full_name: '',
    referee_relationship: '',
    referee_organisation: '',
    referee_position: '',
    referee_phone: '',
    referee_email: '',

    // Step 11: Payment
    payment_preference: '',
    instalment_count: '',

    // Step 12: Declarations
    declaration_accepted: false,
    data_consent_accepted: false,
    promotional_use_consent: false,

    // Step 13: Documents
    doc_cv: null,
    doc_academic_credentials: null,
    doc_nysc_document: null,
    doc_ican_atswa_evidence: null,
    doc_valid_id: null,
  });

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // courseId is actually the slug (passed from /apply/:courseId route)
        const response = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`);
        setCourse(response.data.course);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Could not load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const totalSteps = 14;
  const stepTitles = [
    'Course & Background',
    'Personal Information',
    'Academic Qualifications',
    'Professional Status',
    'NYSC Status',
    'Work Experience',
    'Software Literacy',
    'Motivation',
    'Programme Commitment',
    'Referee Details',
    'Payment Preference',
    'Declaration & Consent',
    'Document Upload',
    'Review & Submit',
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ 
        ...prev, 
        [name]: file,
        [`${name}_file`]: file 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayFieldChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayField = (arrayName) => {
    if (arrayName === 'qualifications') {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, { institution: '', qualification: '', field_of_study: '', class_grade: '', year_completed: '' }]
      }));
    } else if (arrayName === 'work_experience') {
      setFormData(prev => ({
        ...prev,
        work_experience: [...prev.work_experience, { organisation: '', role_title: '', duration: '', duties: '' }]
      }));
    }
  };

  const removeArrayField = (arrayName, index) => {
    setFormData(prev => {
      const newArray = prev[arrayName].filter((_, i) => i !== index);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSkillChange = (skill, value) => {
    setFormData(prev => ({
      ...prev,
      skill_ratings: { ...prev.skill_ratings, [skill]: value }
    }));
  };

  const validateStep = () => {
    const errors = [];

    switch (currentStep) {
      case 1:
        if (!formData.how_heard) errors.push('Please select how you heard about us');
        if (formData.how_heard === 'other' && !formData.how_heard_other) errors.push('Please specify other source');
        if (!formData.passport_photo_file) errors.push('Please upload a passport photo');
        break;
      case 2:
        if (!formData.surname) errors.push('Surname is required');
        if (!formData.first_name) errors.push('First name is required');
        if (!formData.email_address) errors.push('Email address is required');
        if (!formData.phone_numbers) errors.push('Phone number is required');
        if (!formData.residential_address) errors.push('Residential address is required');
        break;
      case 8:
        const why = formData.motivation_why_enrol?.length || 0;
        const exp = formData.motivation_learning_experience?.length || 0;
        if (why < 150 || why > 200) errors.push('Motivation statement 1 must be 150-200 words');
        if (exp < 150 || exp > 200) errors.push('Motivation statement 2 must be 150-200 words');
        break;
      case 12:
        if (!formData.declaration_accepted) errors.push('You must accept the declaration');
        if (!formData.data_consent_accepted) errors.push('You must accept data consent');
        break;
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('course_id', course.id);
      formDataToSend.append('how_heard', formData.how_heard);
      formDataToSend.append('how_heard_other', formData.how_heard_other);
      formDataToSend.append('surname', formData.surname);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('other_names', formData.other_names);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('date_of_birth', formData.date_of_birth);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('state_of_origin', formData.state_of_origin);
      formDataToSend.append('state_of_residence', formData.state_of_residence);
      formDataToSend.append('phone_numbers', formData.phone_numbers);
      formDataToSend.append('email_address', formData.email_address);
      formDataToSend.append('residential_address', formData.residential_address);
      formDataToSend.append('next_of_kin_name', formData.next_of_kin_name);
      formDataToSend.append('next_of_kin_relationship', formData.next_of_kin_relationship);
      formDataToSend.append('next_of_kin_phone', formData.next_of_kin_phone);
      formDataToSend.append('qualifications', JSON.stringify(formData.qualifications));
      formDataToSend.append('professional_status', formData.professional_status);
      formDataToSend.append('membership_reg_number', formData.membership_reg_number);
      formDataToSend.append('date_registered', formData.date_registered);
      formDataToSend.append('other_professional_certifications', formData.other_professional_certifications);
      formDataToSend.append('nysc_status', formData.nysc_status);
      formDataToSend.append('call_up_number', formData.call_up_number);
      formDataToSend.append('state_of_deployment_ppa', formData.state_of_deployment_ppa);
      formDataToSend.append('batch_stream', formData.batch_stream);
      formDataToSend.append('discharge_date', formData.discharge_date);
      formDataToSend.append('work_experience', JSON.stringify(formData.work_experience));
      formDataToSend.append('skill_ratings', JSON.stringify(formData.skill_ratings));
      formDataToSend.append('motivation_why_enrol', formData.motivation_why_enrol);
      formDataToSend.append('motivation_learning_experience', formData.motivation_learning_experience);
      formDataToSend.append('can_attend_hybrid_training', formData.can_attend_hybrid_training);
      formDataToSend.append('can_undertake_internship', formData.can_undertake_internship);
      formDataToSend.append('internship_conditions_notes', formData.internship_conditions_notes);
      formDataToSend.append('preferred_internship_location', formData.preferred_internship_location);
      formDataToSend.append('known_scheduling_conflicts', formData.known_scheduling_conflicts);
      formDataToSend.append('referee_full_name', formData.referee_full_name);
      formDataToSend.append('referee_relationship', formData.referee_relationship);
      formDataToSend.append('referee_organisation', formData.referee_organisation);
      formDataToSend.append('referee_position', formData.referee_position);
      formDataToSend.append('referee_phone', formData.referee_phone);
      formDataToSend.append('referee_email', formData.referee_email);
      formDataToSend.append('payment_preference', formData.payment_preference);
      formDataToSend.append('instalment_count', formData.instalment_count);
      formDataToSend.append('declaration_accepted', formData.declaration_accepted);
      formDataToSend.append('data_consent_accepted', formData.data_consent_accepted);
      formDataToSend.append('promotional_use_consent', formData.promotional_use_consent);

      // Add file uploads
      if (formData.passport_photo_file) {
        formDataToSend.append('passport_photo', formData.passport_photo_file);
      }
      if (formData.doc_cv) formDataToSend.append('doc_cv', formData.doc_cv);
      if (formData.doc_academic_credentials) formDataToSend.append('doc_academic_credentials', formData.doc_academic_credentials);
      if (formData.doc_nysc_document) formDataToSend.append('doc_nysc_document', formData.doc_nysc_document);
      if (formData.doc_ican_atswa_evidence) formDataToSend.append('doc_ican_atswa_evidence', formData.doc_ican_atswa_evidence);
      if (formData.doc_valid_id) formDataToSend.append('doc_valid_id', formData.doc_valid_id);

      const response = await axios.post(`${API_BASE_URL}/api/applications`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setApplicationRef(response.data.application_id_ref);
      setCurrentStep(14);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-center text-slate-600">Loading application form...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="card p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">Course not found</p>
            <button onClick={() => navigate('/courses')} className="btn-primary">
              Back to Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Apply for {course.title}</h1>
          <p className="text-slate-600 text-lg">Complete the application form below. All fields marked with * are required.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12 card p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-600">Step {currentStep} of {totalSteps}</p>
            <p className="text-sm font-medium text-gold-600">{Math.round((currentStep / totalSteps) * 100)}%</p>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-navy-600 to-gold-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 mt-3">{stepTitles[currentStep - 1]}</p>
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

        {/* Form Content */}
        <div className="card p-8 bg-white mb-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[0]}</h2>
              {course && (
                <Step1CourseBackground course={course} formData={formData} handleInputChange={handleInputChange} />
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[1]}</h2>
              <Step2Personal formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[2]}</h2>
              <Step3Qualifications formData={formData} handleArrayFieldChange={handleArrayFieldChange} addArrayField={addArrayField} removeArrayField={removeArrayField} />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[3]}</h2>
              <Step4Professional formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[4]}</h2>
              <Step5NYSC formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[5]}</h2>
              <Step6WorkExperience formData={formData} handleArrayFieldChange={handleArrayFieldChange} addArrayField={addArrayField} removeArrayField={removeArrayField} />
            </div>
          )}

          {currentStep === 7 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[6]}</h2>
              <Step7Software formData={formData} handleSkillChange={handleSkillChange} />
            </div>
          )}

          {currentStep === 8 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[7]}</h2>
              <Step8Motivation formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 9 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[8]}</h2>
              <Step9Commitment formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 10 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[9]}</h2>
              <Step10Referee formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 11 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[10]}</h2>
              <Step11Payment formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 12 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[11]}</h2>
              <Step12Declaration formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 13 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[12]}</h2>
              <Step13Documents formData={formData} handleInputChange={handleInputChange} />
            </div>
          )}

          {currentStep === 14 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{stepTitles[13]}</h2>
              {applicationRef ? (
                <StepSuccess applicationRef={applicationRef} />
              ) : (
                <Step14Review 
                  formData={formData} 
                  course={course} 
                  submitting={submitting} 
                  onSubmit={handleSubmit}
                  onEdit={setCurrentStep} 
                />
              )}
            </div>
          )}
        </div>


        {/* Navigation Buttons */}
        {!applicationRef && (
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button 
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-6 py-3 border-2 border-navy-500 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            
            {currentStep < 14 && (
              <button 
                onClick={handleNextStep}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors font-medium"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {currentStep === 14 && !applicationRef && (
              <button 
                onClick={handleSubmit}
                disabled={submitting || !formData.declaration_accepted || !formData.data_consent_accepted}
                className="ml-auto px-6 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-navy-900 font-bold rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        )}

        {applicationRef && (
          <div className="flex gap-4 mt-8">
            <a href="/application-status" className="ml-auto px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors font-medium">
              Check Status
            </a>
            <a href="/courses" className="px-6 py-3 border-2 border-navy-500 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium">
              Back to Courses
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
