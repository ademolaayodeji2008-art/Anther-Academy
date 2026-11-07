-- Migration: 016_create_expression_of_interest_table.sql
-- Description: Expression of Interest / Consent Form - captures initial interest before application
-- Flow: EOI submission → Admin reviews → Admin grants admission → Student pays ₦2000 → Student fills full application

-- Create ENUM types for EOI
CREATE TYPE preferred_intake_month AS ENUM ('march', 'september', 'not_sure');
CREATE TYPE excel_level_enum AS ENUM ('none', 'basic', 'intermediate', 'advanced');
CREATE TYPE work_experience_years AS ENUM ('none', 'under_1_year', '1_to_2_years', '2_to_3_years', 'more_than_3_years');

-- Create expression of interest table
CREATE TABLE IF NOT EXISTS expressions_of_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SECTION 1: Your Details
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  phone_whatsapp_number VARCHAR(20) NOT NULL,
  gender VARCHAR(20),
  state_of_residence VARCHAR(100),
  
  -- SECTION 2: Your Background
  highest_qualification VARCHAR(100),
  field_of_study VARCHAR(255),
  institution_attended VARCHAR(255),
  year_completed VARCHAR(10),
  professional_status VARCHAR(100),
  nysc_status VARCHAR(100),
  work_experience work_experience_years,
  current_excel_level excel_level_enum,
  
  -- SECTION 3: Your Interest
  preferred_intake_month preferred_intake_month,
  areas_of_interest TEXT[], -- Array: practical_accounting_bookkeeping, tax_compliance_advisory, etc.
  how_heard VARCHAR(255),
  how_heard_other TEXT,
  
  -- SECTION 4: Programme Commitment
  why_interested TEXT NOT NULL, -- 30-100 words motivation
  can_attend_hybrid_training BOOLEAN,
  can_complete_field_internship VARCHAR(50),
  internship_conditions TEXT,
  
  -- SECTION 5: Consent
  consent_information_accurate BOOLEAN NOT NULL DEFAULT FALSE,
  consent_data_storage BOOLEAN NOT NULL DEFAULT FALSE,
  applicant_name VARCHAR(200),
  applicant_signature VARCHAR(200), -- Can be typed name
  signature_date DATE,
  
  -- Admission Status (managed by admin)
  admission_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'admitted', 'not_admitted'
  
  admitted_at TIMESTAMP WITH TIME ZONE,
  admitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  admission_notes TEXT, -- Admin notes for admission decision
  
  -- Link to user account (created when admitted)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Admission form payment status
  admission_form_paid BOOLEAN DEFAULT FALSE,
  admission_form_payment_reference VARCHAR(255),
  admission_form_paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_consent_required CHECK (
    consent_information_accurate = TRUE AND consent_data_storage = TRUE
  )
);

-- Indexes
CREATE INDEX idx_eoi_email ON expressions_of_interest(email_address);
CREATE INDEX idx_eoi_admission_status ON expressions_of_interest(admission_status);
CREATE INDEX idx_eoi_created_at ON expressions_of_interest(created_at DESC);
CREATE INDEX idx_eoi_user_id ON expressions_of_interest(user_id);
CREATE INDEX idx_eoi_payment_ref ON expressions_of_interest(admission_form_payment_reference);
CREATE INDEX idx_eoi_admitted ON expressions_of_interest(admission_status, admitted_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_eoi_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_eoi_timestamp ON expressions_of_interest;
CREATE TRIGGER trigger_eoi_timestamp
BEFORE UPDATE ON expressions_of_interest
FOR EACH ROW
EXECUTE FUNCTION update_eoi_timestamp();

-- Create EOI audit log
CREATE TABLE IF NOT EXISTS eoi_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eoi_id UUID NOT NULL REFERENCES expressions_of_interest(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  old_admission_status VARCHAR(50),
  new_admission_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eoi_audit_eoi_id ON eoi_audit_log(eoi_id);
CREATE INDEX idx_eoi_audit_admin_id ON eoi_audit_log(admin_id);
CREATE INDEX idx_eoi_audit_created_at ON eoi_audit_log(created_at DESC);

-- Comments
COMMENT ON TABLE expressions_of_interest IS 'Expression of Interest / Consent Form. First step before full application. Admin must grant admission before applicant can proceed.';
COMMENT ON COLUMN expressions_of_interest.admission_status IS 'Admission decision by admin: pending, admitted, or not_admitted';
COMMENT ON COLUMN expressions_of_interest.admission_form_paid IS 'Whether applicant paid ₦2000 admission form fee after being admitted';
COMMENT ON COLUMN expressions_of_interest.user_id IS 'User account created when admission is granted';
COMMENT ON TABLE eoi_audit_log IS 'Audit trail for all EOI admission decisions';
