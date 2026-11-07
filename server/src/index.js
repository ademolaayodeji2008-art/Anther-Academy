import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import contactRoutes from './routes/contact.js';
import enrollmentsRoutes from './routes/enrollments.js';
import paymentsRoutes from './routes/payments.js';
import progressRoutes from './routes/progress.js';
import quizzesRoutes from './routes/quizzes.js';
import adminQuizzesRoutes from './routes/admin-quizzes.js';
import certificatesRoutes from './routes/certificates.js';
import adminRoutes from './routes/admin.js';
import adminCoursesRoutes from './routes/admin-courses.js';
import adminAttendanceRoutes from './routes/admin-attendance.js';
import applicationsRoutes from './routes/applications.js';
import eoiRoutes from './routes/eoi.js';
import uploadsRoutes from './routes/uploads.js';
import passwordResetRoutes from './routes/password-reset.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Anther Academy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    paystack_mode: process.env.PAYSTACK_SECRET_KEY?.includes('sk_test') ? 'TEST' : 'LIVE'
  });
});

// Basic root route
app.get('/', (req, res) => {
  res.json({
    name: 'Anther Academy API',
    version: '1.0.0',
    description: 'Online Accounting Training Academy',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/register, /api/auth/login, /api/auth/verify-otp',
      courses: '/api/courses, /api/courses/:courseSlug',
      contact: '/api/contact',
      enrollments: '/api/enrollments, /api/enrollments/status/:enrollmentId',
      payments: '/api/payments/initialize, /api/payments/verify'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/admin/quizzes', adminQuizzesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/courses', adminCoursesRoutes);
app.use('/api/admin/attendance', adminAttendanceRoutes);
app.use('/api/applications', applicationsRoutes);  // Public endpoints: POST /, GET /status
app.use('/api/admin/applications', applicationsRoutes);  // Admin endpoints: GET /, GET /:id, PATCH /:id/review
app.use('/api/eoi', eoiRoutes);  // Expression of Interest routes
app.use('/api/upload', uploadsRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Anther Academy API Server Started    ║
╠════════════════════════════════════════╣
║ Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)} ║
║ Port: ${PORT.toString().padEnd(35)} ║
║ Health Check: /api/health${' '.repeat(20)} ║
║ Endpoints: /api/auth, /api/courses, /api/contact ║
╚════════════════════════════════════════╝
  `);
});

export default app;
