# Anther Academy Database Schema

Complete database schema documentation for the accounting training LMS.

## Overview

The database consists of 10 tables organized into logical groups:

- **Authentication**: `users`
- **Course Management**: `courses`, `modules`, `lessons`
- **Enrollment**: `enrollments`, `payments`
- **Assessment**: `quizzes`, `quiz_questions`, `quiz_attempts`
- **Credentials**: `certificates`

## Table Definitions

### 1. Users Table

Stores user accounts with authentication and role-based access.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student' -- student | admin | instructor
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `full_name`: User's full name
- `email`: Unique email address (indexed for login lookups)
- `phone`: Optional phone number
- `password_hash`: Bcrypt hashed password (NEVER plaintext)
- `role`: User role (student | admin | instructor)
- `email_verified`: Whether email is verified
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp (auto-managed by trigger)

**Indexes:**
- `idx_users_email` - Fast email lookups for login
- `idx_users_role` - Filter users by role
- `idx_users_created_at` - Sort/filter by join date

**Triggers:**
- `users_updated_at_trigger` - Auto-updates `updated_at` on row changes

**Roles:**
- `student` - Can enroll in courses, take quizzes, earn certificates
- `admin` - Full system access, manage courses and users
- `instructor` - Create/edit courses, view student progress

---

### 2. Courses Table

Course definitions for the academy.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  thumbnail_url VARCHAR(500),
  price DECIMAL(10, 2),
  duration_weeks INTEGER,
  level VARCHAR(50), -- new_to_practice | practicing_accountant | chartered_advanced
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `id`: Unique course identifier
- `title`: Course title (e.g., "Financial Accounting Fundamentals")
- `slug`: URL-friendly identifier (e.g., "financial-accounting-fundamentals")
- `description`: Long course description
- `thumbnail_url`: Course cover image URL (Cloudinary)
- `price`: Course price in base currency
- `duration_weeks`: Estimated course duration in weeks
- `level`: Difficulty level for course filtering
- `is_published`: Whether course is visible to students
- `created_by`: FK to user who created the course (instructor/admin)
- `created_at`: Course creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `idx_courses_slug` - Fast URL lookups
- `idx_courses_level` - Filter by difficulty
- `idx_courses_is_published` - Show only published courses
- `idx_courses_created_by` - Find courses by instructor

**Levels:**
- `new_to_practice`: Beginner level, no prerequisites
- `practicing_accountant`: Intermediate, assumes basic knowledge
- `chartered_advanced`: Advanced, for certified professionals

**Relationships:**
- `created_by` → `users.id` - Course creator
- One course has many modules, enrollments, payments, certificates

---

### 3. Modules Table

Organizational units within courses (like chapters).

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(course_id, order_index)
);
```

**Fields:**
- `id`: Unique module identifier
- `course_id`: FK to parent course
- `title`: Module title (e.g., "Introduction to Accounting Concepts")
- `description`: Module overview/learning objectives
- `order_index`: Position within course (1, 2, 3...)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Constraints:**
- `UNIQUE(course_id, order_index)` - No duplicate positions in same course

**Indexes:**
- `idx_modules_course_id` - Find modules in a course
- `idx_modules_course_order` - Retrieve modules in sequence

**Relationships:**
- One module has many lessons and quizzes
- Modules are deleted when course is deleted (CASCADE)

---

### 4. Lessons Table

Individual learning content within modules.

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  content_type VARCHAR(50), -- video | pdf | text
  content_url VARCHAR(500),
  order_index INTEGER,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(module_id, order_index)
);
```

**Fields:**
- `id`: Unique lesson identifier
- `module_id`: FK to parent module
- `title`: Lesson title
- `description`: Lesson overview
- `content_type`: Type of content (video | pdf | text)
- `content_url`: URL to content (Cloudinary for media, or inline for text)
- `order_index`: Position within module
- `duration_minutes`: Estimated time to complete
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Content Types:**
- `video` - Video hosted on Cloudinary
- `pdf` - PDF document (Cloudinary or external)
- `text` - Inline text content

**Constraints:**
- `UNIQUE(module_id, order_index)` - No duplicate positions

**Indexes:**
- `idx_lessons_module_id` - Find lessons in a module
- `idx_lessons_module_order` - Retrieve in sequence

---

### 5. Enrollments Table

Tracks student course enrollment and progress.

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50), -- pending_payment | active | completed | cancelled
  progress_percent INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

**Fields:**
- `id`: Unique enrollment identifier
- `user_id`: FK to enrolled student
- `course_id`: FK to course
- `status`: Enrollment status
- `progress_percent`: Course completion percentage (0-100)
- `enrolled_at`: When student enrolled
- `completed_at`: When course was completed (null if not done)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Statuses:**
- `pending_payment` - Enrolled but payment not complete
- `active` - Paid, can access course
- `completed` - Course finished
- `cancelled` - Enrollment cancelled

**Constraints:**
- `UNIQUE(user_id, course_id)` - One enrollment per student per course

**Indexes:**
- `idx_enrollments_user_id` - Find student's enrollments
- `idx_enrollments_course_id` - Find course enrollments
- `idx_enrollments_status` - Filter by enrollment status
- `idx_enrollments_user_course` - Check if student enrolled in course

---

### 6. Payments Table

Payment transaction records linked to Paystack.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  paystack_reference VARCHAR(255),
  status VARCHAR(50), -- pending | success | failed | cancelled
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `id`: Unique payment identifier
- `user_id`: FK to paying user
- `course_id`: FK to purchased course
- `enrollment_id`: FK to associated enrollment
- `amount`: Payment amount
- `paystack_reference`: Paystack transaction reference (for lookups)
- `status`: Payment status
- `created_at`: Payment initiated timestamp
- `updated_at`: Last status update timestamp

**Statuses:**
- `pending` - Payment initiated, awaiting callback
- `success` - Payment successful, enrollment should be active
- `failed` - Payment failed (retry available)
- `cancelled` - User cancelled payment

**Indexes:**
- `idx_payments_user_id` - Find user's payments
- `idx_payments_course_id` - Find payments for course
- `idx_payments_enrollment_id` - Link to enrollment
- `idx_payments_paystack_reference` - Look up by Paystack ID
- `idx_payments_status` - Filter by payment status

**Workflow:**
1. Student clicks "Enroll" → Creates enrollment (pending_payment)
2. Creates payment record (status: pending)
3. Redirect to Paystack
4. Paystack → Webhook callback
5. Verify & update payment status
6. If success: Update enrollment to active

---

### 7. Quizzes Table

Quiz definitions for module assessments.

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  pass_mark INTEGER DEFAULT 70,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `id`: Unique quiz identifier
- `module_id`: FK to parent module
- `title`: Quiz title
- `description`: Quiz instructions
- `pass_mark`: Passing score (0-100)
- `is_required`: Whether quiz must be completed
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `idx_quizzes_module_id` - Find quizzes in module

**Relationships:**
- One quiz has many quiz questions and quiz attempts

---

### 8. Quiz Questions Table

Multiple-choice questions within quizzes.

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT,
  option_a VARCHAR(500),
  option_b VARCHAR(500),
  option_c VARCHAR(500),
  option_d VARCHAR(500),
  correct_option VARCHAR(1), -- A | B | C | D
  explanation TEXT,
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(quiz_id, order_index)
);
```

**Fields:**
- `id`: Unique question identifier
- `quiz_id`: FK to parent quiz
- `question_text`: The question
- `option_a/b/c/d`: Answer choices
- `correct_option`: Correct answer (A/B/C/D)
- `explanation`: Why the answer is correct (for review)
- `order_index`: Position in quiz
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Constraints:**
- `UNIQUE(quiz_id, order_index)` - No duplicate positions

**Indexes:**
- `idx_quiz_questions_quiz_id` - Find questions in quiz

---

### 9. Quiz Attempts Table

Student quiz submissions and scores.

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  passed BOOLEAN,
  answers JSONB,
  attempted_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Fields:**
- `id`: Unique attempt identifier
- `user_id`: FK to student
- `quiz_id`: FK to quiz
- `score`: Score out of 100
- `passed`: Whether student passed (score >= pass_mark)
- `answers`: JSON object mapping question IDs to student answers
- `attempted_at`: When quiz was submitted
- `created_at`: Record creation timestamp

**Indexes:**
- `idx_quiz_attempts_user_id` - Find student's attempts
- `idx_quiz_attempts_quiz_id` - Find all attempts on quiz
- `idx_quiz_attempts_user_quiz` - Check if student took quiz
- `idx_quiz_attempts_passed` - Find passing/failing students

**Example `answers` JSON:**
```json
{
  "question-id-1": "A",
  "question-id-2": "B",
  "question-id-3": "D"
}
```

---

### 10. Certificates Table

Course completion certificates.

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url VARCHAR(500),
  verification_code VARCHAR(50) UNIQUE,
  issued_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

**Fields:**
- `id`: Unique certificate identifier
- `user_id`: FK to certificate holder
- `course_id`: FK to completed course
- `certificate_url`: URL to certificate PDF (Cloudinary)
- `verification_code`: Unique code for certificate verification
- `issued_at`: Certificate issuance timestamp
- `expires_at`: When certificate expires (null = never)
- `created_at`: Record creation timestamp

**Constraints:**
- `UNIQUE(user_id, course_id)` - One certificate per student per course
- `UNIQUE(verification_code)` - Codes are unique for verification

**Indexes:**
- `idx_certificates_user_id` - Find user's certificates
- `idx_certificates_course_id` - Find certificates for course
- `idx_certificates_verification_code` - Verify certificate authenticity
- `idx_certificates_issued_at` - Filter by date range

**Workflow:**
1. Student completes course (enrollment → completed)
2. System generates certificate PDF
3. Upload to Cloudinary → get URL
4. Create certificate record with verification code
5. Email to student with URL and code

---

## Relationships Diagram

```
users (1)
├── has many courses (as creator)
│   └── created_by → courses.id
├── has many enrollments
│   └── user_id → enrollments.id
├── has many payments
│   └── user_id → payments.id
├── has many quiz_attempts
│   └── user_id → quiz_attempts.id
└── has many certificates
    └── user_id → certificates.id

courses (1)
├── has many modules
│   └── course_id → modules.id
├── has many enrollments
│   └── course_id → enrollments.id
├── has many payments
│   └── course_id → payments.id
└── has many certificates
    └── course_id → certificates.id

modules (1)
├── has many lessons
│   └── module_id → lessons.id
└── has many quizzes
    └── module_id → quizzes.id

quizzes (1)
├── has many quiz_questions
│   └── quiz_id → quiz_questions.id
└── has many quiz_attempts
    └── quiz_id → quiz_attempts.id

enrollments (1)
└── has one payment
    └── enrollment_id → payments.id
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Login lookups |
| users | role | Filter by role |
| courses | slug | URL lookups |
| courses | level | Filter by difficulty |
| courses | is_published | Show only published |
| modules | course_id | Find modules in course |
| modules | course_order | Retrieve in sequence |
| lessons | module_id | Find lessons in module |
| lessons | module_order | Retrieve in sequence |
| enrollments | user_id | Student's enrollments |
| enrollments | course_id | Course enrollments |
| enrollments | status | Filter by status |
| enrollments | user_course | Check enrollment |
| payments | user_id | User's payments |
| payments | course_id | Course payments |
| payments | paystack_ref | Webhook lookups |
| payments | status | Filter by status |
| quizzes | module_id | Module quizzes |
| quiz_attempts | user_id | Student's attempts |
| quiz_attempts | quiz_id | Quiz attempts |
| quiz_attempts | passed | Find pass/fail |
| certificates | user_id | User's certificates |
| certificates | code | Verification |

---

## Data Integrity Features

### Foreign Keys
All relationships use `ON DELETE CASCADE` for automatic cleanup when parent records are deleted.

### Unique Constraints
- `users.email` - Prevent duplicate accounts
- `courses.slug` - Unique URL identifiers
- `modules.order_index` - One position per course
- `lessons.order_index` - One position per module
- `enrollments.user_course` - One enrollment per student per course
- `quiz_questions.order_index` - One position per quiz
- `certificates.user_course` - One cert per student per course
- `certificates.verification_code` - Unique verification codes

### Check Constraints
- `role IN (...)` - Only valid roles
- `level IN (...)` - Only valid levels
- `status IN (...)` - Only valid statuses
- `content_type IN (...)` - Only valid content types
- `pass_mark 0-100` - Valid score range
- `progress_percent 0-100` - Valid percentage
- `score 0-100` - Valid score range
- `correct_option IN ('A','B','C','D')` - Valid answer

### Timestamps
All tables include `created_at` and `updated_at` (where applicable) for audit trails and sorting.

---

## Migration Order

Migrations must run in this order due to foreign key dependencies:

1. `001_create_users_table.sql` - Base table (no deps)
2. `002_create_courses_table.sql` - Depends on users
3. `003_create_modules_table.sql` - Depends on courses
4. `004_create_lessons_table.sql` - Depends on modules
5. `005_create_enrollments_table.sql` - Depends on users, courses
6. `006_create_payments_table.sql` - Depends on users, courses, enrollments
7. `007_create_quizzes_table.sql` - Depends on modules
8. `008_create_quiz_questions_table.sql` - Depends on quizzes
9. `009_create_quiz_attempts_table.sql` - Depends on users, quizzes
10. `010_create_certificates_table.sql` - Depends on users, courses

---

## Performance Considerations

### Indexed Queries
All frequently queried columns are indexed:
- User lookups by email (login)
- Course filtering by level/published status
- Enrollment status checks
- Payment status verification
- Quiz attempt tracking

### Denormalization
Consider adding these columns for performance (not in initial schema):
- `courses.enrollment_count` - Cached total enrollments
- `users.completed_courses_count` - Cached completed count
- `enrollments.lessons_completed` - Cached lesson progress

Update these with triggers when related records change.

### Query Optimization
- Use indexes in WHERE clauses
- Filter by is_published when listing courses
- Use pagination for large result sets
- Cache frequently accessed data (courses, quizzes)

---

## Security Considerations

### Row Level Security (RLS)
Supabase RLS policies should enforce:
- Students can only see published courses
- Students can only access their own enrollments
- Instructors can only edit their own courses
- Admins have full access

### Password Security
- Never store plaintext passwords
- Always hash with bcrypt (10+ salt rounds)
- Use `password_hash` column

### Payment Security
- Use Paystack for PCI compliance
- Verify webhooks with shared secret
- Never store card data locally

### Email Verification
- Require email verification before course access
- Send verification token in URL
- Track `email_verified` flag

---

## Backup & Recovery

Recommend Supabase backup settings:
- Automatic daily backups (30-day retention)
- Point-in-time recovery enabled
- Test restores regularly

---

See `/server/scripts/README.md` for migration and seeding instructions.
