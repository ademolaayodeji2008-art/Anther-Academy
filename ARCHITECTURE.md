# Anther Academy - System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         End Users (Browser)                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP/HTTPS
                    ┌────────────┴────────────┐
                    │                         │
         ┌──────────▼──────────┐   ┌─────────▼────────┐
         │  Frontend Client    │   │  Static Assets   │
         │  (React + Vite)     │   │  (CSS, Images)   │
         │  Port: 5173         │   │  Cloudinary CDN  │
         └──────────┬──────────┘   └──────────────────┘
                    │
                    │ API Requests (CORS Enabled)
                    │ http://localhost:5000/api/*
                    │
         ┌──────────▼──────────────────────────────┐
         │   Express.js Backend API Server         │
         │   Port: 5000                            │
         │   ├─ /                (Info)            │
         │   ├─ /api/health      (Health Check)   │
         │   ├─ /api/auth/*      (Auth Routes)    │
         │   ├─ /api/courses/*   (Course Routes)  │
         │   ├─ /api/payments/*  (Payment Routes) │
         │   └─ /api/users/*     (User Routes)    │
         └──────────┬──────────────────────────────┘
                    │
        ┌───────────┼───────────┬──────────┬────────┐
        │           │           │          │        │
        │           │           │          │        │
   ┌────▼───┐  ┌───▼──────┐ ┌─▼────┐ ┌──▼───┐ ┌─▼────┐
   │Supabase│  │ Nodemailer│ │ JWT  │ │ bcrypt│ │Paystack
   │Database│  │(Gmail)    │ │Token │ │Hash  │ │API
   │PostgreSQL │ SMTP      │ │Verify│ │Pass  │ │Webhook
   └────────┘  └───────────┘ └──────┘ └──────┘ └──────┘
        │           │
   ┌────▼──────────▼────────┐
   │ External Services      │
   │ ├─ Supabase (Auth)    │
   │ ├─ Cloudinary (Files) │
   │ ├─ Paystack (Payment) │
   │ └─ Gmail (Email)      │
   └────────────────────────┘
```

## 📊 Request Flow Example: User Enrollment

```
User (Browser)
    │
    ├─ 1. Clicks "Enroll Course"
    │
    ├─ 2. POST /api/courses/enroll (with auth token)
    │     └─ Frontend sends JWT token
    │
    ├─ 3. Express Server receives request
    │     ├─ Verify JWT token (no database call)
    │     ├─ Query Supabase: Check course exists
    │     ├─ Query Supabase: Check user enrollment
    │     ├─ Insert enrollment record in Supabase
    │
    ├─ 4. Trigger email notification
    │     └─ Nodemailer sends via Gmail SMTP
    │
    ├─ 5. Return success response (JSON)
    │
    └─ 6. Frontend updates UI (React re-renders)
```

## 🎯 Technology Layers

### Presentation Layer (Frontend)
```
React Components
    ├─ Pages (Courses, Dashboard, etc.)
    ├─ Components (Cards, Forms, etc.)
    └─ Hooks (State management)
         │
         ├─ Tailwind CSS (Styling)
         │
         ├─ React Router (Navigation)
         │
         └─ Axios (API Calls)
              │
              └─ Backend API (Port 5000)
```

### Application Layer (Backend)
```
Express.js Server
    ├─ Route Handlers
    │   ├─ /api/auth
    │   ├─ /api/courses
    │   ├─ /api/users
    │   ├─ /api/payments
    │   └─ /api/health
    │
    ├─ Middleware
    │   ├─ CORS
    │   ├─ JSON Parser
    │   ├─ Auth (JWT)
    │   └─ Error Handler
    │
    ├─ Services
    │   ├─ Database (Supabase)
    │   ├─ Email (Nodemailer)
    │   ├─ Auth (JWT, bcrypt)
    │   ├─ Payments (Paystack)
    │   └─ Files (Cloudinary)
    │
    └─ Database Connection
         └─ Supabase PostgreSQL
```

### Data Layer
```
Supabase (Managed PostgreSQL)
    ├─ Tables
    │   ├─ users
    │   ├─ courses
    │   ├─ enrollments
    │   ├─ payments
    │   ├─ certificates
    │   └─ lessons
    │
    ├─ Auth (Built-in JWT)
    │
    └─ Real-time Subscriptions
```

### External Services
```
Third-Party Integrations
    ├─ Supabase
    │   ├─ Database (PostgreSQL)
    │   ├─ Authentication
    │   └─ Real-time DB
    │
    ├─ Cloudinary
    │   ├─ Image Storage & Optimization
    │   ├─ Video Streaming
    │   └─ PDF Storage
    │
    ├─ Paystack
    │   ├─ Payment Processing
    │   ├─ Webhook Verification
    │   └─ Receipt Generation
    │
    └─ Gmail SMTP
        ├─ OTP Delivery
        ├─ Receipts
        └─ Notifications
```

## 🔄 Data Flow Diagrams

### Authentication Flow
```
User Login
    │
    ├─ 1. Submit email + password
    │
    ├─ 2. Backend: Hash password with bcrypt
    │
    ├─ 3. Backend: Compare with Supabase stored hash
    │
    ├─ 4. Match? Generate JWT token
    │
    ├─ 5. Return token to frontend
    │
    ├─ 6. Frontend: Store token in localStorage
    │
    ├─ 7. All future requests: Include token in header
    │
    └─ 8. Backend: Verify token on each request
```

### Payment Flow
```
User Enrolls in Course
    │
    ├─ 1. Frontend: Initialize Paystack payment
    │
    ├─ 2. Paystack: Display payment form
    │
    ├─ 3. User: Enter card details
    │
    ├─ 4. Paystack: Process payment → Success
    │
    ├─ 5. Paystack: Send webhook to backend
    │
    ├─ 6. Backend: Verify webhook signature
    │
    ├─ 7. Backend: Create enrollment in Supabase
    │
    ├─ 8. Backend: Send receipt email via Gmail
    │
    ├─ 9. Frontend: Show success & generate certificate
    │
    └─ 10. User: Download certificate from Cloudinary
```

### File Upload Flow
```
User Uploads Course Material
    │
    ├─ 1. Frontend: Select file (PDF, Video, Image)
    │
    ├─ 2. Frontend: Upload to Cloudinary
    │
    ├─ 3. Cloudinary: Process & optimize file
    │
    ├─ 4. Cloudinary: Return public URL
    │
    ├─ 5. Frontend: Send metadata + URL to backend
    │
    ├─ 6. Backend: Store URL in Supabase
    │
    └─ 7. Frontend/Users: Access file via Cloudinary CDN
```

## 🗄️ Database Schema Overview

```
Supabase PostgreSQL
│
├─ users
│   ├─ id (UUID)
│   ├─ email (UNIQUE)
│   ├─ password_hash
│   ├─ full_name
│   ├─ phone
│   ├─ avatar_url (Cloudinary)
│   ├─ created_at
│   └─ updated_at
│
├─ courses
│   ├─ id (UUID)
│   ├─ title
│   ├─ description
│   ├─ instructor_id (FK: users)
│   ├─ thumbnail_url (Cloudinary)
│   ├─ price
│   ├─ duration_hours
│   ├─ created_at
│   └─ updated_at
│
├─ enrollments
│   ├─ id (UUID)
│   ├─ user_id (FK: users)
│   ├─ course_id (FK: courses)
│   ├─ progress_percent
│   ├─ completed_at
│   ├─ enrolled_at
│   └─ payment_id (FK: payments)
│
├─ lessons
│   ├─ id (UUID)
│   ├─ course_id (FK: courses)
│   ├─ title
│   ├─ content
│   ├─ video_url (Cloudinary)
│   ├─ pdf_url (Cloudinary)
│   ├─ order
│   └─ created_at
│
├─ payments
│   ├─ id (UUID)
│   ├─ user_id (FK: users)
│   ├─ course_id (FK: courses)
│   ├─ amount
│   ├─ status (pending, completed, failed)
│   ├─ reference (Paystack)
│   ├─ receipt_url (Cloudinary)
│   ├─ paid_at
│   └─ created_at
│
└─ certificates
    ├─ id (UUID)
    ├─ user_id (FK: users)
    ├─ course_id (FK: courses)
    ├─ certificate_url (Cloudinary)
    ├─ issue_date
    └─ expiry_date (optional)
```

## 🔐 Security Architecture

```
Frontend (React)
    │
    ├─ HTTPS/TLS Encryption
    │
    ├─ JWT Token Storage (localStorage)
    │
    └─ CORS Headers
         │
         └─ Backend (Express)
              │
              ├─ CORS Middleware (Whitelist)
              │
              ├─ JWT Verification
              │   └─ Token must match secret
              │
              ├─ Rate Limiting (future)
              │
              ├─ Input Validation
              │   └─ All user data checked
              │
              ├─ Password Hashing (bcrypt)
              │   └─ Never store plaintext
              │
              ├─ Environment Variables
              │   └─ Secrets in .env
              │
              └─ External Services
                  ├─ Supabase: Row-level security
                  ├─ Paystack: Webhook verification
                  └─ Cloudinary: Signed URLs
```

## 🚀 Deployment Architecture (Future)

```
Production Environment
│
├─ Frontend: Vercel / Netlify
│   ├─ Built from: client/ directory
│   ├─ Deploy: npm run build → dist/
│   └─ CDN: Global edge network
│
├─ Backend: Railway / Render / Heroku
│   ├─ Built from: server/ directory
│   ├─ Runs: npm start
│   ├─ Port: 5000 (or custom)
│   └─ Auto-scaling: Based on traffic
│
├─ Database: Supabase (Managed)
│   ├─ PostgreSQL on cloud
│   ├─ Automated backups
│   └─ Replication
│
├─ Static Files: Cloudinary CDN
│   ├─ Images optimized
│   ├─ Videos streamed
│   └─ Global cache
│
└─ Email: Gmail SMTP (Production)
    └─ Or SendGrid for higher volume
```

## 📈 Performance Considerations

### Frontend Performance
- Vite: Fast HMR (Hot Module Replacement)
- Tailwind: Optimized CSS output
- React: Virtual DOM rendering
- Code splitting: Lazy load routes (future)

### Backend Performance
- Express: Lightweight framework
- Middleware: Efficient request processing
- Supabase: Indexed queries
- Connection pooling: Managed by Supabase

### Database Performance
- Indexes on frequently queried columns
- Row-level security (RLS) enabled
- Connection pooling for concurrent requests
- Backup strategy (Supabase managed)

## 🔌 API Integration Points

```
Frontend → Backend
    │
    └─ Axios: HTTP client
         │
         └─ Request Headers
              ├─ Authorization: "Bearer {JWT_TOKEN}"
              ├─ Content-Type: "application/json"
              └─ CORS headers

Backend → External APIs
    │
    ├─ Supabase: @supabase/supabase-js SDK
    ├─ Paystack: Axios HTTP calls
    ├─ Cloudinary: cloudinary SDK
    └─ Gmail: Nodemailer (SMTP)
```

## 📦 Environment Configuration

```
Development (Localhost)
├─ Frontend: http://localhost:5173
├─ Backend: http://localhost:5000
├─ Database: Supabase (cloud)
└─ Files: Cloudinary (cloud)

Staging (Before Production)
├─ Frontend: https://staging.antheracademy.com
├─ Backend: https://api-staging.antheracademy.com
├─ Database: Supabase (cloud)
└─ Files: Cloudinary (cloud)

Production (Live)
├─ Frontend: https://antheracademy.com
├─ Backend: https://api.antheracademy.com
├─ Database: Supabase (cloud, replicated)
└─ Files: Cloudinary (cloud, CDN global)
```

## 🎯 Ready to Build

Your architecture supports:
- ✅ Multiple users
- ✅ Course management
- ✅ Payment processing
- ✅ Email notifications
- ✅ File storage
- ✅ Authentication
- ✅ Real-time updates (future)
- ✅ Scalability to thousands of users

All pieces are in place. Start building! 🚀
