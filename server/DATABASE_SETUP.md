# Database Setup Guide - Anther Academy

Complete step-by-step guide to set up your PostgreSQL database on Supabase.

## Prerequisites

- Supabase account at https://app.supabase.com
- Project created and running
- `.env` file with Supabase credentials:
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SECRET_KEY=sb_secret_xxxxx
  ```

## 🚀 Quick Start (5 minutes)

### Step 1: Run Migrations

Copy and execute each migration file in Supabase SQL Editor:

**Go to:** Supabase Dashboard → SQL Editor → New Query

For each file in `/server/migrations/` (001 through 010):
1. Open file
2. Copy all content
3. Paste into SQL Editor
4. Click Execute (⌘+Enter)

**Migration order is CRITICAL:**
1. `001_create_users_table.sql` ✅
2. `002_create_courses_table.sql` ✅
3. `003_create_modules_table.sql` ✅
4. `004_create_lessons_table.sql` ✅
5. `005_create_enrollments_table.sql` ✅
6. `006_create_payments_table.sql` ✅
7. `007_create_quizzes_table.sql` ✅
8. `008_create_quiz_questions_table.sql` ✅
9. `009_create_quiz_attempts_table.sql` ✅
10. `010_create_certificates_table.sql` ✅

### Step 2: Verify Schema

Run this verification query in SQL Editor:

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output (10 tables):
```
certificates       | 7 columns
courses            | 12 columns
enrollments        | 9 columns
lessons            | 10 columns
modules            | 7 columns
payments           | 8 columns
quiz_attempts      | 7 columns
quiz_questions     | 10 columns
quizzes            | 7 columns
users              | 9 columns
```

### Step 3: Seed Sample Data

Run from terminal:

```bash
cd server
npm install         # If not done yet
npm run seed        # Creates admin user + 2 courses
```

Wait for success output:
```
✨ Database seed completed successfully!

📊 Summary:
  • Admin user: admin@antheracademy.com (password: AdminPassword123!)
  • Courses created: 2
  • Total modules: 7
  • Total lessons: 23
  • Quizzes created: 1
```

### Step 4: Verify Sample Data

Run these queries in SQL Editor to confirm:

```sql
-- Check admin user
SELECT id, full_name, email, role FROM users WHERE role = 'admin';

-- Check courses
SELECT id, title, slug, level FROM courses ORDER BY created_at;

-- Check course structure
SELECT c.title, COUNT(m.id) as modules, COUNT(l.id) as lessons
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
GROUP BY c.id, c.title;

-- Check quizzes
SELECT q.title, COUNT(qq.id) as questions
FROM quizzes q
LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
GROUP BY q.id, q.title;
```

✅ **Done!** Your database is ready for development.

---

## 📋 Detailed Step-by-Step

### A. Prepare Supabase Project

1. **Create Project** (if not done)
   - Go to https://app.supabase.com
   - Click "New Project"
   - Name: "anther-academy"
   - Database password: Strong random password
   - Region: Select closest to you
   - Click "Create new project"

2. **Wait for Setup**
   - Takes 1-2 minutes
   - You'll see "Your database is ready"

3. **Get Credentials**
   - Go to Project Settings (gear icon)
   - Click "API"
   - Copy "Project URL" → `SUPABASE_URL`
   - Copy "secret" key (starts with `sb_secret_`) → `SUPABASE_SECRET_KEY`
   - Save to `.env` file

### B. Create Schema

1. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query" button

2. **Execute Migration 001**
   - Open `/server/migrations/001_create_users_table.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click "Execute" (or press ⌘+Enter)
   - Wait for success message

3. **Repeat for Migrations 002-010**
   - Open each migration file
   - Copy content
   - Paste and execute
   - Move to next migration

**⚠️ IMPORTANT**: Execute in order (001, 002, 003, ..., 010)

### C. Seed Sample Data

1. **Terminal Command**
   ```bash
   cd server
   npm run seed
   ```

2. **What Gets Created**
   - Admin user: `admin@antheracademy.com`
   - Password: `AdminPassword123!` (change in production!)
   - 2 sample courses with full curriculum
   - 7 modules with 23 lessons total
   - 1 quiz with 3 practice questions

3. **Save Credentials**
   - Email: `admin@antheracademy.com`
   - Password: `AdminPassword123!`
   - Store securely (LastPass, 1Password, etc.)

### D. Configure Row Level Security (RLS)

Optional but recommended for production:

1. **Go to Authentication**
   - Left sidebar → "Authentication"
   - Click "Policies" tab

2. **Enable RLS on tables** (one by one)
   - Select table
   - Click "Enable RLS"
   - Create policies for:
     - Public can read published courses
     - Authenticated can read their own data
     - Instructors can read/edit their courses
     - Admins have full access

See `/server/SCHEMA.md` for RLS policy examples.

### E. Set Up Backups (Production)

1. **Go to Project Settings**
2. **Click "Backups"**
3. **Enable automated backups**
   - Daily backups minimum
   - 30-day retention

---

## 🧪 Testing the Setup

### Test Connection

```bash
curl -X GET https://your-project.supabase.co/rest/v1/users \
  -H "apikey: your-public-key" \
  -H "Authorization: Bearer your-session-token"
```

### Query with Node.js

```javascript
import supabase from './server/src/config/supabase.js';

// Test connection
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) console.error('Error:', error);
else console.log('Users:', data);
```

### Verify Indexes

Run in SQL Editor:

```sql
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should see all indexes from migrations (e.g., `idx_users_email`, `idx_courses_slug`, etc.).

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] All 10 tables created
- [ ] All foreign keys in place
- [ ] All indexes created
- [ ] Admin user exists (`admin@antheracademy.com`)
- [ ] 2 courses created ("Financial Accounting", "Taxation & Auditing")
- [ ] 7 modules total (3 + 4)
- [ ] 23 lessons total
- [ ] 1 quiz created
- [ ] 3 quiz questions created
- [ ] Can query each table from Node.js

---

## ⚡ Common Issues & Solutions

### Issue: "Relation does not exist"

**Cause**: Migration didn't execute or FK references missing table

**Solution**:
1. Check migration file executed successfully
2. Verify previous migrations ran first
3. Run verification query to list tables

### Issue: "Foreign key constraint failed"

**Cause**: Running migrations out of order

**Solution**:
1. Delete all tables (Danger Zone in Supabase Settings)
2. Start fresh from migration 001
3. Execute in order: 001, 002, 003, ..., 010

### Issue: "Seed fails - table not found"

**Cause**: Migrations incomplete

**Solution**:
1. Re-run all migrations
2. Verify all 10 tables exist
3. Then run seed script

### Issue: "SUPABASE_SECRET_KEY invalid"

**Cause**: Wrong key or `.env` not loaded

**Solution**:
1. Check `.env` has `SUPABASE_SECRET_KEY` (starts with `sb_secret_`)
2. Check it's in `/server/.env` not `/client/.env`
3. Restart server: `npm run dev`

### Issue: "Permission denied - table"

**Cause**: RLS policies blocking access

**Solution**:
1. Go to Table → RLS Settings
2. Disable RLS temporarily for testing
3. Add proper policies later (see SCHEMA.md)

---

## 🚀 Next Steps

After successful setup:

1. **Implement Auth API** (`/server/src/routes/auth.js`)
   - User registration
   - Login with JWT
   - Email verification

2. **Create Course API** (`/server/src/routes/courses.js`)
   - List courses
   - Get course details
   - Filter by level

3. **Build Enrollment API** (`/server/src/routes/enrollments.js`)
   - Enroll in course
   - Get enrollment status
   - Track progress

4. **Set up Payments** (`/server/src/routes/payments.js`)
   - Initialize Paystack payment
   - Handle webhook
   - Update enrollment status

5. **Build Frontend UI**
   - Course listing page
   - Course detail page
   - Enrollment flow
   - Dashboard

See `/server/src/` for API implementation.

---

## 📚 Schema Reference

For detailed schema documentation, see `/server/SCHEMA.md`:
- Complete field descriptions
- All indexes explained
- Relationships diagram
- Data integrity features
- Query optimization tips

For migration files, see `/server/migrations/`:
- 001-010: Create all tables
- Each file has detailed comments

---

## 🔐 Security Reminders

- [ ] Never commit `.env` with real keys
- [ ] Use `SUPABASE_SECRET_KEY` on backend only
- [ ] Use `VITE_SUPABASE_ANON_KEY` on frontend
- [ ] Enable RLS in production
- [ ] Hash passwords with bcrypt (never plaintext)
- [ ] Verify Paystack webhooks
- [ ] Rotate credentials regularly
- [ ] Monitor access logs

---

## 📞 Support

If issues arise:

1. Check this guide's "Common Issues" section
2. Review `/server/scripts/manual-migrations.md`
3. See `/server/SCHEMA.md` for schema details
4. Check Supabase logs for errors
5. Review `.env` configuration

---

**You're ready to build! 🚀**

Next: Implement authentication API endpoints
