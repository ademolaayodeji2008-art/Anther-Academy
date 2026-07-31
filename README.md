# Anther Academy - Online Accounting Training Platform

A full-stack web application for delivering professional accounting training courses with certifications, flexible payments, and secure course management.

## 🏗️ Project Structure

```
anther-academy/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx       # Entry point
│   │   ├── App.jsx        # Root component with routing
│   │   ├── index.css      # Tailwind styles + custom components
│   │   ├── components/
│   │   │   ├── Navigation.jsx     # Main nav bar
│   │   │   ├── Footer.jsx          # Footer component
│   │   │   ├── ProtectedRoute.jsx  # Auth wrapper
│   │   │   └── auth/
│   │   │       ├── LoginForm.jsx
│   │   │       ├── RegisterForm.jsx
│   │   │       └── OTPVerificationForm.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Hero, why-us, courses, testimonials
│   │   │   ├── CourseCatalogPage.jsx     # Course grid with filtering
│   │   │   ├── CourseDetailPage.jsx      # Single course + curriculum
│   │   │   ├── AboutPage.jsx             # Mission, values, facilitators
│   │   │   └── ContactPage.jsx           # Contact form + FAQ
│   │   └── lib/
│   │       ├── authService.js    # Auth API calls
│   │       └── supabase.js        # Supabase client init
│   ├── vite.config.js
│   ├── tailwind.config.js  # Navy/Gold design system
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
│
├── server/                # Node.js + Express backend
│   ├── src/
│   │   ├── index.js       # Express server
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── courses.js   # GET /api/courses, /api/courses/:slug
│   │   │   └── contact.js   # POST /api/contact
│   │   └── utils/
│   │       └── emailService.js
│   ├── migrations/
│   │   └── [001-011_*.sql]
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## 🎨 Design System

The application uses a professional Navy + Gold palette suitable for finance and education:

### Colors
- **Navy** (#2c5aa0): Primary brand color - trust, professionalism
- **Gold** (#ffd700): Accent color - prestige, excellence
- **Forest Green** (#2d6a5c): Secondary accent - growth, stability
- **Slate**: Neutral grays for typography and UI elements

### Typography
- **Sans Serif**: Inter (default body font)
- **Serif**: Merriweather (for emphasis and headings)

### Components
- `.btn-primary`: Navy buttons with gold hover states
- `.btn-secondary`: Gold buttons with navy text
- `.btn-outline`: Navy outline buttons
- `.card`: White cards with subtle shadows
- `.input-field`: Styled form inputs with focus states
- `.section-title` / `.section-subtitle`: Heading utilities

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Git

### Installation

1. Clone and setup the project:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

2. Configure environment variables:

**Server** (`server/.env`):
```bash
cp server/.env.example server/.env
# Edit server/.env with your credentials
```

**Client** (`client/.env`):
```bash
cp client/.env.example client/.env
# Edit client/.env with API URL
```

### Running Locally

**Option 1: Separate Terminals** (Recommended for development)

Terminal 1 - Start the backend:
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

Terminal 2 - Start the frontend:
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

**Option 2: Both in One Terminal**

Terminal 1:
```bash
cd server && npm run dev & cd ../client && npm run dev
```

### Verify Installation

Check the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Anther Academy API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

Then open `http://localhost:5173` in your browser to see the landing page.

## 📄 Pages & Routes

### Public Routes
- `/` — Home page (hero, why-choose-us, featured courses, testimonials, stats)
- `/courses` — Course catalog with filtering by professional level
- `/courses/:courseSlug` — Course detail page with curriculum & instructor info
- `/about` — Academy mission, values, and facilitator profiles
- `/contact` — Contact form & FAQ
- `/register` — Registration form
- `/verify-otp` — OTP verification screen
- `/login` — Login form

### Protected Routes
- `/dashboard` — Student dashboard (coming soon)

## 🔧 Environment Variables

### Backend (`server/.env`)

**Server Configuration**
- `NODE_ENV`: Set to `development` or `production`
- `PORT`: API server port (default: 5000)
- `API_BASE_URL`: Full API URL for external services
- `CLIENT_URL`: Frontend URL for CORS

**Database (Supabase)**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SECRET_KEY`: Service role key for server-side operations

**Authentication**
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRY`: Token expiry time (default: 7d)

**Payments (Paystack)**
- `PAYSTACK_SECRET_KEY`: Paystack secret key

**File Storage (Cloudinary)**
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

**Email (Gmail SMTP)**
- `GMAIL_SMTP_USER`: Gmail address
- `GMAIL_SMTP_PASS`: Gmail app-specific password
- `EMAIL_FROM_NAME`: Sender name in emails
- `EMAIL_FROM_ADDRESS`: Sender email address
- `ADMIN_EMAIL`: Admin email for contact form submissions

### Frontend (`client/.env`)

- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000)
- `VITE_APP_NAME`: App name
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable key
- `VITE_PAYSTACK_PUBLIC_KEY`: Paystack public key

## 📦 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 5** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router 6** - Client-side routing
- **Supabase JS** - Database and auth client

### Backend
- **Express 4** - Web framework
- **Node.js** - JavaScript runtime
- **Supabase** - PostgreSQL database + auth
- **JWT** - Token-based authentication
- **Nodemailer** - Email service
- **Cloudinary** - Media storage and optimization
- **Paystack** - Payment processing
- **bcrypt** - Password hashing

### Deployment-Ready
- **PostgreSQL** - Database (via Supabase)
- **Docker** - Containerization ready (add Dockerfile when needed)

## 🛠️ Available Scripts

### Frontend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Backend
```bash
npm start        # Start production server
npm run dev      # Start dev server with nodemon (auto-restart)
npm run lint     # Run ESLint
npm run migrate  # Run database migrations
npm run seed     # Seed database with sample data
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` — Create new student account
- `POST /api/auth/verify-otp` — Verify OTP for email
- `POST /api/auth/resend-otp` — Regenerate and resend OTP
- `POST /api/auth/login` — Login with email/password
- `GET /api/auth/me` — Get current user (protected)
- `POST /api/auth/logout` — Logout (protected)

### Courses
- `GET /api/courses` — List all published courses (supports `?level=` filter, `?limit=`, `?offset=`)
- `GET /api/courses/:courseSlug` — Get single course with modules and lessons

### Contact
- `POST /api/contact` — Submit contact form

### Health
- `GET /api/health` — Health check endpoint

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Use environment-specific secrets in production
- Change `JWT_SECRET` to a strong, random value
- Passwords are hashed with bcrypt (10 salt rounds)
- OTP expires after 10 minutes
- Frontend JWT stored in localStorage (note XSS risk; consider httpOnly cookies for production)
- Supabase uses SECRET_KEY on backend (bypasses RLS, safe server-side)
- Frontend uses PUBLISHABLE_KEY (enforces RLS, safe for browser)

## 🚢 Deployment

### Backend Deployment (Vercel, Railway, Render, Heroku)
1. Push `server` directory to your deployment platform
2. Set environment variables in deployment dashboard
3. Ensure Node.js version is specified
4. Deploy with `npm start` as start command

### Frontend Deployment (Vercel, Netlify, AWS S3)
1. Set `VITE_API_BASE_URL` to production API URL
2. Run `npm run build`
3. Deploy `dist` folder
4. Configure environment variables in deployment platform

## 📝 Next Steps

1. Set up database schema in Supabase (run migrations)
2. Seed sample courses and instructors
3. Implement payment integration (Paystack)
4. Set up email notifications
5. Create admin dashboard for course management
6. Implement student progress tracking
7. Add certificate generation

## 📞 Support & Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Express Documentation](https://expressjs.com)
- [Supabase Docs](https://supabase.com/docs)
- [Paystack Documentation](https://paystack.com/docs)

## 📄 License

ISC
