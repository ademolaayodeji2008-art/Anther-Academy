-- Migration: 015_create_programme_applications_table.sql
-- Description: Programme Application system for course admissions
-- Applicants must apply for a specific course and be admitted before enrollment

-- Create ENUM types
CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'admitted', 'waitlisted', 'not_admitted');
CREATE TYPE how_heard_source AS ENUM ('university_career_office', 'nysc_orientation_camp', 'ican_student_body', 'social_media', 'referral', 'other');
CREATE TYPE professional_status_enum AS ENUM ('not_registered', 'atswa_student', 'atswa_level_1', 'atswa_level_2', 'atswa_level_3', 'ican_professional_student', 'aca_newly_qualified');
CREATE TYPE nysc_status_enum AS ENUM ('currently_serving', 'completed_discharged', 'exempted', 'not_applicable');
CREATE TYPE internship_option AS ENUM ('yes', 'no', 'yes_with_conditions');
CREATE TYPE payment_option AS ENUM ('full_upfront', 'instalment');

-- Create main applications table
CREATE TABLE IF NOT EXISTS programme_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Application Reference
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  application_id_ref VARCHAR(20) NOT NULL UNIQUE,
  date_of_application TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- How heard about program
  how_heard how_heard_source NOT NULL,
  how_heard_other TEXT,
  
  -- Passport Photo (Authenticated Cloudinary)
  passport_photo_url TEXT,
  passport_photo_public_id TEXT,
  
  -- SECTION A: Personal/Bio-data
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  other_names VARCHAR(100),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  date_of_birth DATE,
  nationality VARCHAR(100),
  state_of_origin VARCHAR(100),
  state_of_residence VARCHAR(100),
  phone_numbers TEXT[] NOT NULL, -- Array of phone numbers
  email_address VARCHAR(255) NOT NULL,
  residential_address TEXT NOT NULL,
  
  -- Next of Kin
  next_of_kin_name VARCHAR(100),
  next_of_kin_relationship VARCHAR(100),
  next_of_kin_phone VARCHAR(20),
  
  -- SECTION B: Academic Qualifications (JSONB Array)
  qualifications JSONB, -- Array: [{institution, qualification, field_of_study, class_grade, year_completed}, ...]
  
  -- SECTION C: Professional Status
  professional_status professional_status_enum,
  membership_reg_number VARCHAR(100),
  date_registered DATE,
  other_professional_certifications TEXT,
  
  -- SECTION D: NYSC Status
  nysc_status nysc_status_enum,
  call_up_number VARCHAR(100),
  state_of_deployment_ppa VARCHAR(100),
  batch_stream VARCHAR(50),
  discharge_date DATE,
  
  -- SECTION E: Work Experience (JSONB Array)
  work_experience JSONB, -- Array: [{organisation, role_title, duration, duties}, ...]
  
  -- SECTION F: Software Literacy Self-Assessment (JSONB)
  skill_ratings JSONB, -- {ms_excel, ms_word_powerpoint, accounting_software, accounting_software_specify, power_bi_google_data_studio, internet_email_research}
  
  -- SECTION G: Motivation Statement
  motivation_why_enrol TEXT CHECK (motivation_why_enrol IS NULL OR LENGTH(motivation_why_enrol) BETWEEN 150 AND 200),
  motivation_learning_experience TEXT CHECK (motivation_learning_experience IS NULL OR LENGTH(motivation_learning_experience) BETWEEN 150 AND 200),
  
  -- SECTION H: Programme Commitment & Logistics
  can_attend_hybrid_training BOOLEAN,
  can_undertake_internship internship_option,
  internship_conditions_notes TEXT,
  preferred_internship_location VARCHAR(255),
  known_scheduling_conflicts TEXT,
  
  -- SECTION I: Referee Details
  referee_full_name VARCHAR(100),
  referee_relationship VARCHAR(100),
  referee_organisation VARCHAR(255),
  referee_position VARCHAR(100),
  referee_phone VARCHAR(20),
  referee_email VARCHAR(255),
  
  -- SECTION J: Payment Preference
  payment_preference payment_option,
  instalment_count INTEGER CHECK (instalment_count IS NULL OR instalment_count > 0),
  
  -- SECTION K: Declaration & Consent
  declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  data_consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  promotional_use_consent BOOLEAN DEFAULT FALSE,
  
  -- SECTION L: Document Uploads (All Authenticated Cloudinary)
  doc_cv_url TEXT,
  doc_cv_public_id TEXT,
  
  doc_academic_credentials_url TEXT,
  doc_academic_credentials_public_id TEXT,
  
  doc_nysc_document_url TEXT,
  doc_nysc_document_public_id TEXT,
  
  doc_ican_atswa_evidence_url TEXT,
  doc_ican_atswa_evidence_public_id TEXT,
  
  doc_valid_id_url TEXT,
  doc_valid_id_public_id TEXT,
  
  -- Admissions Panel Fields (Admin-Only)
  status application_status NOT NULL DEFAULT 'submitted',
  aptitude_test_score INTEGER CHECK (aptitude_test_score IS NULL OR (aptitude_test_score >= 0 AND aptitude_test_score <= 100)),
  interview_score INTEGER CHECK (interview_score IS NULL OR (interview_score >= 0 AND interview_score <= 100)),
  panel_comments TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_required_fields CHECK (
    declaration_accepted = TRUE AND data_consent_accepted = TRUE
  )
);

-- Indexes
CREATE INDEX idx_programme_applications_course_id ON programme_applications(course_id);
CREATE INDEX idx_programme_applications_user_id ON programme_applications(user_id);
CREATE INDEX idx_programme_applications_application_id_ref ON programme_applications(application_id_ref);
CREATE INDEX idx_programme_applications_email ON programme_applications(email_address);
CREATE INDEX idx_programme_applications_status ON programme_applications(status);
CREATE INDEX idx_programme_applications_created_at ON programme_applications(created_at DESC);
CREATE INDEX idx_programme_applications_course_status ON programme_applications(course_id, status);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_programme_applications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_programme_applications_timestamp ON programme_applications;
CREATE TRIGGER trigger_programme_applications_timestamp
BEFORE UPDATE ON programme_applications
FOR EACH ROW
EXECUTE FUNCTION update_programme_applications_timestamp();

-- Create audit log table for applications
CREATE TABLE IF NOT EXISTS application_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES programme_applications(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- submitted, under_review, admitted, waitlisted, not_admitted, scored, commented
  old_status application_status,
  new_status application_status,
  aptitude_test_score_change VARCHAR(50), -- "70 → 75"
  interview_score_change VARCHAR(50),
  comments_change TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_application_audit_application_id ON application_audit_log(application_id);
CREATE INDEX idx_application_audit_admin_id ON application_audit_log(admin_id);
CREATE INDEX idx_application_audit_created_at ON application_audit_log(created_at DESC);

-- Comments
COMMENT ON TABLE programme_applications IS 'Programme applications for course admissions. Applicants apply for specific courses and must be admitted before enrollment.';
COMMENT ON TABLE application_audit_log IS 'Audit trail of all application status changes and admin reviews for compliance.';
COMMENT ON COLUMN programme_applications.application_id_ref IS 'Human-readable auto-generated reference: AA-{year}-{5-digit sequence}';
COMMENT ON COLUMN programme_applications.how_heard IS 'How applicant heard about the programme';
COMMENT ON COLUMN programme_applications.passport_photo_url IS 'Authenticated Cloudinary URL (requires signed token to access)';
COMMENT ON COLUMN programme_applications.qualifications IS 'JSONB array of academic qualifications';
COMMENT ON COLUMN programme_applications.work_experience IS 'JSONB array of work experience records';
COMMENT ON COLUMN programme_applications.skill_ratings IS 'JSONB object with software skill self-ratings';
COMMENT ON COLUMN programme_applications.status IS 'Application review status by admissions panel';
COMMENT ON COLUMN programme_applications.reviewed_by IS 'Admin who conducted the review';
