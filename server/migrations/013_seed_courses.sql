-- Migration: 013_seed_courses.sql
-- Description: Seed database with published courses

-- First, insert or get an admin user for created_by
INSERT INTO users (full_name, email, password_hash, role, email_verified)
VALUES (
  'Anther Academy Admin',
  'admin@antheracademy.com',
  '$2b$10$YourHashedPasswordHere', -- Placeholder - update with actual hash
  'admin',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID
WITH admin_user AS (
  SELECT id FROM users WHERE email = 'admin@antheracademy.com' LIMIT 1
)

-- Insert published courses
INSERT INTO courses (
  title,
  slug,
  description,
  thumbnail_url,
  price,
  duration_weeks,
  level,
  is_published,
  created_by
)
SELECT
  'Financial Accounting Fundamentals',
  'financial-accounting-fundamentals',
  'Master the basics of financial accounting and statement preparation. Learn core principles that every accountant needs to know.',
  'https://via.placeholder.com/400x250?text=Financial+Accounting',
  25000.00,
  6,
  'new_to_practice',
  TRUE,
  admin_user.id
FROM admin_user
WHERE NOT EXISTS (
  SELECT 1 FROM courses WHERE slug = 'financial-accounting-fundamentals'
)

UNION ALL

SELECT
  'Taxation & Auditing Basics',
  'taxation-auditing-basics',
  'Essential tax principles and audit procedures for practicing accountants. Understand compliance requirements and best practices.',
  'https://via.placeholder.com/400x250?text=Taxation+%26+Auditing',
  35000.00,
  8,
  'practicing_accountant',
  TRUE,
  admin_user.id
FROM admin_user
WHERE NOT EXISTS (
  SELECT 1 FROM courses WHERE slug = 'taxation-auditing-basics'
);
