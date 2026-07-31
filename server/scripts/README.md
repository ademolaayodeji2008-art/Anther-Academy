# Database Scripts

This directory contains scripts for managing the Anther Academy database.

## Scripts

### `migrate.js` - Database Migrations

Runs all SQL migration files to create the database schema.

```bash
npm run migrate
```

**What it does:**
- Scans the `/migrations` directory for `.sql` files
- Executes them in order (001_, 002_, etc.)
- Creates all tables with proper relationships and indexes

**Migration files:**
- `001_create_users_table.sql` - Users with authentication
- `002_create_courses_table.sql` - Course definitions
- `003_create_modules_table.sql` - Course modules
- `004_create_lessons_table.sql` - Lesson content
- `005_create_enrollments_table.sql` - Student enrollments
- `006_create_payments_table.sql` - Payment tracking
- `007_create_quizzes_table.sql` - Quiz definitions
- `008_create_quiz_questions_table.sql` - Quiz questions
- `009_create_quiz_attempts_table.sql` - Student quiz attempts
- `010_create_certificates_table.sql` - Course certificates

### `seed.js` - Database Seed

Creates sample data for testing:
- 1 admin user
- 2 sample courses with modules and lessons
- 1 sample quiz with questions

```bash
npm run seed
```

**What it creates:**
- Admin account: `admin@antheracademy.com` / `AdminPassword123!`
- Course 1: "Financial Accounting Fundamentals" (8 weeks)
  - 3 modules with 12 lessons total
- Course 2: "Taxation & Auditing Basics" (10 weeks)
  - 4 modules with 11 lessons total
- 1 quiz with 3 practice questions

## Setup Instructions

### 1. Create Migrations in Supabase

Copy each migration file content and run in Supabase SQL Editor:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Paste the content from each migration file in order:
   - `001_create_users_table.sql`
   - `002_create_courses_table.sql`
   - ... (continue through 010)
5. Click **Execute** for each

**Or** if you have SQL access configured in your `.env`:
```bash
npm run migrate
```

### 2. Seed Sample Data

Once migrations are complete, populate with test data:

```bash
npm run seed
```

This will create:
- Admin user (check terminal for credentials)
- Sample courses with complete curriculum
- Quiz with practice questions

### Verify Setup

Test your database with:

```sql
-- Count tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count sample data
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as courses FROM courses;
SELECT COUNT(*) as modules FROM modules;
SELECT COUNT(*) as lessons FROM lessons;
```

## Production Checklist

Before deploying:

- [ ] All 10 migrations executed
- [ ] Sample data seeded in development
- [ ] Admin user credentials saved securely
- [ ] SEED script never run in production
- [ ] .env contains correct Supabase keys
- [ ] Row Level Security (RLS) policies configured
- [ ] Backups enabled in Supabase

## Troubleshooting

### "Foreign key constraint failed"

Migrations must run in order. Ensure you've run:
1. `001_create_users_table.sql` first
2. Then `002_create_courses_table.sql`
3. Continue in numerical order

### "Table already exists"

All migration files include `IF NOT EXISTS`, so they're safe to re-run.

### "Missing .env variables"

Ensure `server/.env` has:
```
SUPABASE_URL=your-url
SUPABASE_SECRET_KEY=your-secret-key
```

### Seed fails to create admin

Check that:
- Migrations have completed
- SUPABASE_SECRET_KEY has proper permissions
- bcryptjs is installed: `npm install bcryptjs`

## Resetting Database

To start fresh (in development only):

1. Go to Supabase Dashboard
2. Settings → Danger Zone → **Delete database**
3. Confirm to recreate
4. Re-run all migrations
5. Re-run seed script

## Schema Overview

```
users (1)
├── has many courses (as creator)
├── has many enrollments
├── has many payments
├── has many quiz_attempts
└── has many certificates

courses (n)
├── has many modules
├── has many enrollments
├── has many payments
└── has many certificates

modules (n)
├── has many lessons
└── has many quizzes

lessons (n)
└── belongs to module

enrollments (n)
└── has one payment

payments (n)
└── belongs to enrollment

quizzes (n)
└── has many quiz_questions
└── has many quiz_attempts

quiz_questions (n)
└── belongs to quiz

quiz_attempts (n)
├── belongs to user
└── belongs to quiz

certificates (n)
├── belongs to user
└── belongs to course
```

## Next Steps

After setup, you can:
1. Create authentication API endpoints
2. Build course enrollment flow
3. Implement quiz submission
4. Set up payment processing
5. Generate certificates
6. Create admin dashboard

See `/server/src` for API implementation.
