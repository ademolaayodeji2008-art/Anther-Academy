// Step 1: Course & Background
export function Step1CourseBackground({ course, formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gold-50 border border-gold-200 rounded-lg">
        <p className="text-sm text-slate-600 mb-1">You are applying for:</p>
        <p className="text-xl font-bold text-navy-900">{course.title}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-3">
          How did you hear about us? <span className="text-red-500">*</span>
        </label>
        <select 
          name="how_heard" 
          value={formData.how_heard} 
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">Select an option</option>
          <option value="university_career_office">University Career Office</option>
          <option value="nysc_orientation_camp">NYSC Orientation Camp</option>
          <option value="ican_student_body">ICAN Student Body</option>
          <option value="social_media">Social Media</option>
          <option value="referral">Referral from a friend</option>
          <option value="other">Other</option>
        </select>
      </div>

      {formData.how_heard === 'other' && (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Please specify <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="how_heard_other" 
            value={formData.how_heard_other} 
            onChange={handleInputChange}
            placeholder="e.g., newspaper, event, etc."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-3">
          Passport Photo <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-navy-500 transition-colors">
          <input 
            type="file" 
            name="passport_photo" 
            onChange={handleInputChange}
            accept="image/*"
            className="hidden"
            id="passport_photo_input"
          />
          <label htmlFor="passport_photo_input" className="cursor-pointer block">
            <p className="text-slate-700 font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
            {formData.passport_photo_file && (
              <p className="text-sm text-green-600 mt-2">✓ {formData.passport_photo_file.name}</p>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

// Step 2: Personal Information
export function Step2Personal({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Surname <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="surname" 
            value={formData.surname} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Other Names</label>
          <input 
            type="text" 
            name="other_names" 
            value={formData.other_names} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Gender</label>
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Date of Birth</label>
          <input 
            type="date" 
            name="date_of_birth" 
            value={formData.date_of_birth} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input 
            type="email" 
            name="email_address" 
            value={formData.email_address} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input 
            type="tel" 
            name="phone_numbers" 
            value={formData.phone_numbers} 
            onChange={handleInputChange}
            placeholder="e.g., +234 XXX XXX XXXX"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Residential Address <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="residential_address" 
          value={formData.residential_address} 
          onChange={handleInputChange}
          rows="3"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        ></textarea>
      </div>

      <div className="border-t pt-6 mt-6">
        <h4 className="font-medium text-slate-900 mb-4">Next of Kin</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            name="next_of_kin_name" 
            placeholder="Full Name"
            value={formData.next_of_kin_name} 
            onChange={handleInputChange}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
          <input 
            type="text" 
            name="next_of_kin_relationship" 
            placeholder="Relationship"
            value={formData.next_of_kin_relationship} 
            onChange={handleInputChange}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
          <input 
            type="tel" 
            name="next_of_kin_phone" 
            placeholder="Phone Number"
            value={formData.next_of_kin_phone} 
            onChange={handleInputChange}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>
    </div>
  );
}


// Step 3: Academic Qualifications
export function Step3Qualifications({ formData, handleArrayFieldChange, addArrayField, removeArrayField }) {
  return (
    <div className="space-y-6">
      <p className="text-slate-600">Add your academic qualifications. You can add multiple entries.</p>
      
      {formData.qualifications.map((qual, idx) => (
        <div key={idx} className="p-6 border border-slate-200 rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-slate-900">Qualification {idx + 1}</h4>
            {formData.qualifications.length > 1 && (
              <button 
                onClick={() => removeArrayField('qualifications', idx)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Institution"
              value={qual.institution} 
              onChange={(e) => handleArrayFieldChange('qualifications', idx, 'institution', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
            <input 
              type="text" 
              placeholder="Qualification (e.g., B.Sc., OND)"
              value={qual.qualification} 
              onChange={(e) => handleArrayFieldChange('qualifications', idx, 'qualification', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Field of Study"
              value={qual.field_of_study} 
              onChange={(e) => handleArrayFieldChange('qualifications', idx, 'field_of_study', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
            <input 
              type="text" 
              placeholder="Class/Grade"
              value={qual.class_grade} 
              onChange={(e) => handleArrayFieldChange('qualifications', idx, 'class_grade', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
            <input 
              type="number" 
              placeholder="Year Completed"
              value={qual.year_completed} 
              onChange={(e) => handleArrayFieldChange('qualifications', idx, 'year_completed', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>
        </div>
      ))}

      <button 
        onClick={() => addArrayField('qualifications')}
        className="px-4 py-2 border-2 border-navy-500 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium"
      >
        + Add Another Qualification
      </button>
    </div>
  );
}

// Step 4: Professional Status
export function Step4Professional({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-3">Professional Status</label>
        <select 
          name="professional_status" 
          value={formData.professional_status} 
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">Select status</option>
          <option value="not_registered">Not Registered</option>
          <option value="atswa_student">ATSWA Student</option>
          <option value="atswa_level_1">ATSWA Level 1</option>
          <option value="atswa_level_2">ATSWA Level 2</option>
          <option value="atswa_level_3">ATSWA Level 3</option>
          <option value="ican_professional_student">ICAN Professional Student</option>
          <option value="aca_newly_qualified">ACA (Newly Qualified)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Membership Registration Number</label>
          <input 
            type="text" 
            name="membership_reg_number" 
            value={formData.membership_reg_number} 
            onChange={handleInputChange}
            placeholder="e.g., ICAN/123456"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Date Registered</label>
          <input 
            type="date" 
            name="date_registered" 
            value={formData.date_registered} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">Other Professional Certifications</label>
        <textarea 
          name="other_professional_certifications" 
          value={formData.other_professional_certifications} 
          onChange={handleInputChange}
          rows="3"
          placeholder="List any other professional certifications you hold"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        ></textarea>
      </div>
    </div>
  );
}

// Step 5: NYSC Status
export function Step5NYSC({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-3">NYSC Status</label>
        <select 
          name="nysc_status" 
          value={formData.nysc_status} 
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">Select NYSC status</option>
          <option value="currently_serving">Currently Serving</option>
          <option value="completed_discharged">Completed/Discharged</option>
          <option value="exempted">Exempted</option>
          <option value="not_applicable">Not Applicable</option>
        </select>
      </div>

      {formData.nysc_status && formData.nysc_status !== 'not_applicable' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            name="call_up_number" 
            value={formData.call_up_number} 
            onChange={handleInputChange}
            placeholder="Call-up Number"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
          <input 
            type="text" 
            name="state_of_deployment_ppa" 
            value={formData.state_of_deployment_ppa} 
            onChange={handleInputChange}
            placeholder="State of Deployment (PPA)"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      )}

      {formData.nysc_status && formData.nysc_status !== 'not_applicable' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            name="batch_stream" 
            value={formData.batch_stream} 
            onChange={handleInputChange}
            placeholder="Batch/Stream"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
          <input 
            type="date" 
            name="discharge_date" 
            value={formData.discharge_date} 
            onChange={handleInputChange}
            placeholder="Discharge Date"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      )}
    </div>
  );
}


// Step 6: Work Experience
export function Step6WorkExperience({ formData, handleArrayFieldChange, addArrayField, removeArrayField }) {
  return (
    <div className="space-y-6">
      <p className="text-slate-600">Add your work experience. You can add multiple entries.</p>
      
      {formData.work_experience.map((exp, idx) => (
        <div key={idx} className="p-6 border border-slate-200 rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-slate-900">Experience {idx + 1}</h4>
            {formData.work_experience.length > 1 && (
              <button 
                onClick={() => removeArrayField('work_experience', idx)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Organisation"
              value={exp.organisation} 
              onChange={(e) => handleArrayFieldChange('work_experience', idx, 'organisation', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
            <input 
              type="text" 
              placeholder="Job Title"
              value={exp.role_title} 
              onChange={(e) => handleArrayFieldChange('work_experience', idx, 'role_title', e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Duration (e.g., 2 years)"
              value={exp.duration} 
              onChange={(e) => handleArrayFieldChange('work_experience', idx, 'duration', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          <textarea 
            placeholder="Key responsibilities and duties"
            value={exp.duties} 
            onChange={(e) => handleArrayFieldChange('work_experience', idx, 'duties', e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          ></textarea>
        </div>
      ))}

      <button 
        onClick={() => addArrayField('work_experience')}
        className="px-4 py-2 border-2 border-navy-500 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium"
      >
        + Add Work Experience
      </button>
    </div>
  );
}

// Step 7: Software Skills
export function Step7Software({ formData, handleSkillChange }) {
  const skills = [
    { key: 'ms_excel', label: 'MS Excel' },
    { key: 'ms_word_powerpoint', label: 'MS Word & PowerPoint' },
    { key: 'accounting_software', label: 'Accounting Software' },
    { key: 'power_bi_google_data_studio', label: 'Power BI / Google Data Studio' },
    { key: 'internet_email_research', label: 'Internet, Email & Research Tools' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-slate-600">Rate your proficiency in each software/skill:</p>
      
      {skills.map((skill) => (
        <div key={skill.key} className="p-4 border border-slate-200 rounded-lg">
          <label className="block text-sm font-medium text-slate-900 mb-3">{skill.label}</label>
          <div className="flex gap-2">
            {['none', 'basic', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => handleSkillChange(skill.key, level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  formData.skill_ratings[skill.key] === level
                    ? 'bg-navy-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      ))}

      {formData.skill_ratings.accounting_software === 'basic' || 
       formData.skill_ratings.accounting_software === 'intermediate' ||
       formData.skill_ratings.accounting_software === 'advanced' ? (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Please specify which accounting software:</label>
          <input 
            type="text" 
            name="accounting_software_specify" 
            value={formData.skill_ratings.accounting_software_specify} 
            onChange={(e) => handleSkillChange('accounting_software_specify', e.target.value)}
            placeholder="e.g., QuickBooks, Sage, ACCPAC"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      ) : null}
    </div>
  );
}

// Step 8: Motivation Statement
export function Step8Motivation({ formData, handleInputChange }) {
  const countWords = (text) => text.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const why_words = countWords(formData.motivation_why_enrol);
  const exp_words = countWords(formData.motivation_learning_experience);

  const getWordCountColor = (count) => {
    if (count < 150) return 'text-red-600';
    if (count > 200) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-end mb-2">
          <label className="block text-sm font-medium text-slate-900">
            Why do you want to enrol in this programme? <span className="text-red-500">*</span>
          </label>
          <span className={`text-sm font-medium ${getWordCountColor(why_words)}`}>
            {why_words} / 150-200 words
          </span>
        </div>
        <textarea 
          name="motivation_why_enrol" 
          value={formData.motivation_why_enrol} 
          onChange={handleInputChange}
          rows="5"
          placeholder="Describe your motivation for enrolling..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        ></textarea>
        <p className="text-xs text-slate-500 mt-1">Minimum 150 words, maximum 200 words</p>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <label className="block text-sm font-medium text-slate-900">
            What learning experience are you hoping to gain? <span className="text-red-500">*</span>
          </label>
          <span className={`text-sm font-medium ${getWordCountColor(exp_words)}`}>
            {exp_words} / 150-200 words
          </span>
        </div>
        <textarea 
          name="motivation_learning_experience" 
          value={formData.motivation_learning_experience} 
          onChange={handleInputChange}
          rows="5"
          placeholder="Describe your learning goals..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        ></textarea>
        <p className="text-xs text-slate-500 mt-1">Minimum 150 words, maximum 200 words</p>
      </div>
    </div>
  );
}


// Step 9: Programme Commitment
export function Step9Commitment({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="p-4 border border-slate-200 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            name="can_attend_hybrid_training" 
            checked={formData.can_attend_hybrid_training} 
            onChange={handleInputChange}
            className="w-4 h-4 text-navy-600"
          />
          <span className="text-slate-900 font-medium">I can attend hybrid training sessions</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-3">Can you undertake an internship?</label>
        <select 
          name="can_undertake_internship" 
          value={formData.can_undertake_internship} 
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="yes_with_conditions">Yes, with conditions</option>
        </select>
      </div>

      {formData.can_undertake_internship === 'yes_with_conditions' && (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Please specify your conditions:</label>
          <textarea 
            name="internship_conditions_notes" 
            value={formData.internship_conditions_notes} 
            onChange={handleInputChange}
            rows="3"
            placeholder="e.g., only during holidays, only in Lagos, etc."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          ></textarea>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">Preferred internship location</label>
        <input 
          type="text" 
          name="preferred_internship_location" 
          value={formData.preferred_internship_location} 
          onChange={handleInputChange}
          placeholder="e.g., Lagos, Abuja, Remote"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">Any known scheduling conflicts?</label>
        <textarea 
          name="known_scheduling_conflicts" 
          value={formData.known_scheduling_conflicts} 
          onChange={handleInputChange}
          rows="3"
          placeholder="e.g., NYSC duty postings, other training programmes, etc."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        ></textarea>
      </div>
    </div>
  );
}

// Step 10: Referee Details
export function Step10Referee({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <p className="text-slate-600">Provide details of a professional referee who can speak to your competence.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          name="referee_full_name" 
          placeholder="Full Name"
          value={formData.referee_full_name} 
          onChange={handleInputChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
        <input 
          type="text" 
          name="referee_relationship" 
          placeholder="Relationship (e.g., Manager, Mentor)"
          value={formData.referee_relationship} 
          onChange={handleInputChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          name="referee_organisation" 
          placeholder="Organisation"
          value={formData.referee_organisation} 
          onChange={handleInputChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
        <input 
          type="text" 
          name="referee_position" 
          placeholder="Position/Title"
          value={formData.referee_position} 
          onChange={handleInputChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="tel" 
          name="referee_phone" 
          placeholder="Phone Number"
          value={formData.referee_phone} 
          onChange={handleInputChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
        <input 
          type="email" 
          name="referee_email" 
          placeholder="Email Address"
          value={formData.referee_email} 
          onChange={handleInputChange}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>
    </div>
  );
}

// Step 11: Payment Preference
export function Step11Payment({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-3">How would you like to pay?</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
            <input 
              type="radio" 
              name="payment_preference" 
              value="full_upfront" 
              checked={formData.payment_preference === 'full_upfront'}
              onChange={handleInputChange}
              className="w-4 h-4 text-navy-600"
            />
            <div>
              <p className="font-medium text-slate-900">Full Payment Upfront</p>
              <p className="text-sm text-slate-600">Pay the full course fee now</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
            <input 
              type="radio" 
              name="payment_preference" 
              value="instalment" 
              checked={formData.payment_preference === 'instalment'}
              onChange={handleInputChange}
              className="w-4 h-4 text-navy-600"
            />
            <div>
              <p className="font-medium text-slate-900">Instalment Payment</p>
              <p className="text-sm text-slate-600">Pay in installments over time</p>
            </div>
          </label>
        </div>
      </div>

      {formData.payment_preference === 'instalment' && (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Number of instalments</label>
          <select 
            name="instalment_count" 
            value={formData.instalment_count} 
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">Select number of payments</option>
            <option value="2">2 payments</option>
            <option value="3">3 payments</option>
            <option value="4">4 payments</option>
            <option value="6">6 payments</option>
          </select>
        </div>
      )}
    </div>
  );
}

// Step 12: Declaration & Consent
export function Step12Declaration({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">Please review and accept the following statements to proceed:</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
          <input 
            type="checkbox" 
            name="declaration_accepted" 
            checked={formData.declaration_accepted} 
            onChange={handleInputChange}
            className="w-5 h-5 text-navy-600 mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">I declare that all information provided is true and accurate</p>
            <p className="text-sm text-slate-600 mt-1">I understand that any false information may result in rejection or dismissal from the programme.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
          <input 
            type="checkbox" 
            name="data_consent_accepted" 
            checked={formData.data_consent_accepted} 
            onChange={handleInputChange}
            className="w-5 h-5 text-navy-600 mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">I consent to the processing of my personal data</p>
            <p className="text-sm text-slate-600 mt-1">Anther Academy will process my data in accordance with data protection regulations. I understand this is required to process my application.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
          <input 
            type="checkbox" 
            name="promotional_use_consent" 
            checked={formData.promotional_use_consent} 
            onChange={handleInputChange}
            className="w-5 h-5 text-navy-600 mt-1"
          />
          <div>
            <p className="font-medium text-slate-900">I consent to promotional use of my information (optional)</p>
            <p className="text-sm text-slate-600 mt-1">Anther Academy may contact me about future programmes and opportunities. This is optional.</p>
          </div>
        </label>
      </div>

      {!formData.declaration_accepted || !formData.data_consent_accepted ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700"><strong>Note:</strong> You must accept both declarations to proceed.</p>
        </div>
      ) : null}
    </div>
  );
}


// Step 13: Document Upload
export function Step13Documents({ formData, handleInputChange }) {
  const documents = [
    { key: 'doc_cv', label: 'Curriculum Vitae (CV)', accept: '.pdf,.doc,.docx' },
    { key: 'doc_academic_credentials', label: 'Academic Credentials/Certificates', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'doc_nysc_document', label: 'NYSC Document/Proof', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'doc_ican_atswa_evidence', label: 'ICAN/ATSWA Registration Evidence', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'doc_valid_id', label: 'Valid ID (Passport/National ID)', accept: '.pdf,.jpg,.jpeg,.png' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-slate-600">Upload the required supporting documents. All files will be kept confidential.</p>

      {documents.map((doc) => (
        <div key={doc.key} className="p-4 border border-slate-200 rounded-lg">
          <label className="block text-sm font-medium text-slate-900 mb-3">{doc.label}</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-navy-500 transition-colors">
            <input 
              type="file" 
              name={doc.key} 
              onChange={handleInputChange}
              accept={doc.accept}
              className="hidden"
              id={`${doc.key}_input`}
            />
            <label htmlFor={`${doc.key}_input`} className="cursor-pointer block">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-700 font-medium mb-1">Click to upload</p>
              <p className="text-xs text-slate-500">Max 10MB</p>
              {formData[doc.key] && (
                <p className="text-sm text-green-600 mt-2">✓ {formData[doc.key].name}</p>
              )}
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

// Step 14: Review & Submit
export function Step14Review({ formData, course, submitting, onSubmit, onEdit }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">Please review your information before submitting. You can edit any section by clicking the edit link.</p>
      </div>

      {/* Course Summary */}
      <div className="p-6 border border-slate-200 rounded-lg">
        <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
          Course & Background
          <button onClick={() => onEdit(1)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
        </h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Course:</span> {course.title}</p>
          <p><span className="font-medium">How heard:</span> {formData.how_heard || 'Not specified'}</p>
          <p><span className="font-medium">Passport photo:</span> {formData.passport_photo_file?.name ? '✓ Uploaded' : 'Not uploaded'}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="p-6 border border-slate-200 rounded-lg">
        <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
          Personal Information
          <button onClick={() => onEdit(2)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Name:</span> {formData.first_name} {formData.surname}</p>
          <p><span className="font-medium">Email:</span> {formData.email_address}</p>
          <p><span className="font-medium">Phone:</span> {formData.phone_numbers}</p>
          <p><span className="font-medium">Gender:</span> {formData.gender || 'Not specified'}</p>
        </div>
      </div>

      {/* Additional Sections */}
      {formData.qualifications[0].institution && (
        <div className="p-6 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
            Qualifications
            <button onClick={() => onEdit(3)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
          </h3>
          <p className="text-sm text-slate-700">{formData.qualifications.length} qualification(s) added</p>
        </div>
      )}

      {formData.work_experience[0].organisation && (
        <div className="p-6 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
            Work Experience
            <button onClick={() => onEdit(6)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
          </h3>
          <p className="text-sm text-slate-700">{formData.work_experience.length} experience(s) added</p>
        </div>
      )}

      {/* Payment Preference */}
      <div className="p-6 border border-slate-200 rounded-lg">
        <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
          Payment Preference
          <button onClick={() => onEdit(11)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
        </h3>
        <p className="text-sm text-slate-700">{formData.payment_preference === 'full_upfront' ? 'Full Payment Upfront' : 'Instalment Payment'}</p>
      </div>

      {/* Declaration Status */}
      <div className="p-6 border border-slate-200 rounded-lg">
        <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
          Declaration & Consent
          <button onClick={() => onEdit(12)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
        </h3>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <span className={formData.declaration_accepted ? 'text-green-600' : 'text-red-600'}>
              {formData.declaration_accepted ? '✓' : '✗'}
            </span>
            <span>Declaration accepted</span>
          </p>
          <p className="flex items-center gap-2">
            <span className={formData.data_consent_accepted ? 'text-green-600' : 'text-red-600'}>
              {formData.data_consent_accepted ? '✓' : '✗'}
            </span>
            <span>Data consent accepted</span>
          </p>
        </div>
      </div>

      {/* Documents */}
      <div className="p-6 border border-slate-200 rounded-lg">
        <h3 className="font-bold text-slate-900 mb-3 flex justify-between items-center">
          Documents
          <button onClick={() => onEdit(13)} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Edit</button>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p className="flex items-center gap-2">
            <span className={formData.doc_cv ? 'text-green-600' : 'text-slate-400'}>
              {formData.doc_cv ? '✓' : '○'}
            </span>
            <span>CV</span>
          </p>
          <p className="flex items-center gap-2">
            <span className={formData.doc_academic_credentials ? 'text-green-600' : 'text-slate-400'}>
              {formData.doc_academic_credentials ? '✓' : '○'}
            </span>
            <span>Academic Credentials</span>
          </p>
          <p className="flex items-center gap-2">
            <span className={formData.doc_nysc_document ? 'text-green-600' : 'text-slate-400'}>
              {formData.doc_nysc_document ? '✓' : '○'}
            </span>
            <span>NYSC Document</span>
          </p>
          <p className="flex items-center gap-2">
            <span className={formData.doc_ican_atswa_evidence ? 'text-green-600' : 'text-slate-400'}>
              {formData.doc_ican_atswa_evidence ? '✓' : '○'}
            </span>
            <span>ICAN/ATSWA Evidence</span>
          </p>
          <p className="flex items-center gap-2">
            <span className={formData.doc_valid_id ? 'text-green-600' : 'text-slate-400'}>
              {formData.doc_valid_id ? '✓' : '○'}
            </span>
            <span>Valid ID</span>
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={submitting || !formData.declaration_accepted || !formData.data_consent_accepted}
        className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-navy-900 font-bold rounded-lg transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </div>
  );
}

// Success Step
export function StepSuccess({ applicationRef }) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-900 mb-2">Application Submitted Successfully!</h2>
        <p className="text-green-700">Your application has been received and is awaiting review.</p>
      </div>

      <div className="p-8 border-2 border-gold-300 bg-gold-50 rounded-lg text-center">
        <p className="text-sm text-slate-600 mb-2">Your Application Reference Number:</p>
        <p className="text-4xl font-bold text-navy-900 font-mono mb-4 tracking-wide">{applicationRef}</p>
        <p className="text-slate-700 font-medium">Save this number — you'll need it to check your application status</p>
      </div>

      <div className="space-y-3">
        <p className="text-slate-700">Next steps:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>You will receive a confirmation email at the address you provided</li>
          <li>Our admissions panel will review your application</li>
          <li>You can check your status anytime using your reference number</li>
          <li>If admitted, you'll receive an email with payment instructions</li>
        </ul>
      </div>

      <a href="/application-status" className="block w-full py-3 bg-navy-600 hover:bg-navy-700 text-white font-bold text-center rounded-lg transition-colors">
        Check Application Status
      </a>
    </div>
  );
}
