# Manual Migration Instructions

If automated migration script doesn't work, use this guide to run migrations manually in Supabase.

## Steps

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste Each Migration**
   - Open migration file from `/server/migrations/`
   - Copy all content
   - Paste into SQL Editor
   - Click **Execute** (⌘+Enter or Ctrl+Enter)
   - Wait for success message

4. **Execute in This Order**

### Migration 1: Users Table
File: `001_create_users_table.sql`
- Creates users with authentication fields
- Adds updated_at trigger

### Migration 2: Courses Table
File: `002_create_courses_table.sql`
- Creates courses with FK to users (creator)
- Adds indexes for frequently queried columns

### Migration 3: Modules Table
File: `003_create_modules_table.sql`
- Creates course modules
- FK to courses

### Migration 4: Lessons Table
File: `004_create_lessons_table.sql`
- Creates lessons within modules
- FK to modules

### Migration 5: Enrollments Table
File: `005_create_enrollments_table.sql`
- Student course enrollments
- Tracks enrollment status and progress

### Migration 6: Payments Table
File: `006_create_payments_table.sql`
- Payment records linked to Paystack
- FK to users, courses, enrollments

### Migration 7: Quizzes Table
File: `007_create_quizzes_table.sql`
- Quiz definitions within modules
- FK to modules

### Migration 8: Quiz Questions Table
File: `008_create_quiz_questions_table.sql`
- Quiz questions (multiple choice)
- FK to quizzes

### Migration 9: Quiz Attempts Table
File: `009_create_quiz_attempts_table.sql`
- Student quiz submissions
- Tracks scores and pass/fail

### Migration 10: Certificates Table
File: `010_create_certificates_table.sql`
- Course completion certificates
- Unique verification codes

## Verify Setup

After all migrations, run this query to confirm:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- certificates
- courses
- enrollments
- lessons
- modules
- payments
- quiz_attempts
- quiz_questions
- quizzes
- users

## Seed Data (After Migrations)

Once migrations are complete, run:

```bash
npm run seed
```

This creates:
- Admin user
- 2 sample courses
- Modules and lessons
- Sample quiz

## Troubleshooting

### Error: "Relation already exists"
- Migrations are idempotent (safe to re-run)
- Or: You already ran this migration
- Solution: Continue to next migration

### Error: "Constraint violation"
- Likely trying to run migrations out of order
- Solution: Run migrations 001-010 in sequence

### Error: "Permission denied"
- SUPABASE_SECRET_KEY missing or invalid
- Solution: Check `.env` file has correct key

### No tables appear
- Migrations didn't execute successfully
- Solution: Check browser console for errors
- Try executing migrations one at a time

## Quick Reference

| File | Creates | Depends On |
|------|---------|-----------|
| 001 | users | - |
| 002 | courses | users |
| 003 | modules | courses |
| 004 | lessons | modules |
| 005 | enrollments | users, courses |
| 006 | payments | users, courses, enrollments |
| 007 | quizzes | modules |
| 008 | quiz_questions | quizzes |
| 009 | quiz_attempts | users, quizzes |
| 010 | certificates | users, courses |

## Next: Seed Database

After confirming all tables exist:

```bash
cd server
npm run seed
```

Check for output showing:
- ✅ Admin user created
- ✅ Courses created
- ✅ Modules created
- ✅ Lessons created
- ✅ Quiz created

Done! 🎉
