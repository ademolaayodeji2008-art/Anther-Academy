import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterForm from './components/auth/RegisterForm';
import OTPVerificationForm from './components/auth/OTPVerificationForm';
import LoginForm from './components/auth/LoginForm';
import HomePage from './pages/HomePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProgrammeApplicationPage from './pages/ProgrammeApplicationPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminApplicationDetailPage from './pages/AdminApplicationDetailPage';
import SetPasswordPage from './pages/SetPasswordPage';
import CheckoutGuard from './components/CheckoutGuard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import DashboardPage from './pages/DashboardPage';
import LearningPage from './pages/LearningPage';
import QuizPage from './pages/QuizPage';
import AdminQuizBuilderPage from './pages/AdminQuizBuilderPage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateVerifyPage from './pages/CertificateVerifyPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminEnrollmentsPage from './pages/AdminEnrollmentsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/apply/:courseId" element={<ProgrammeApplicationPage />} />
        <Route path="/application-status" element={<ApplicationStatusPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify-otp" element={<OTPVerificationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/verify/:code" element={<CertificateVerifyPage />} />

        {/* Payment & Checkout Routes */}
        <Route 
          path="/checkout/:courseSlug" 
          element={
            <ProtectedRoute>
              <CheckoutGuard>
                <CheckoutPage />
              </CheckoutGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment-callback" 
          element={
            <ProtectedRoute>
              <PaymentCallbackPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/learning/:enrollmentId" 
          element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:quizId" 
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Routes - Certificates */}
        <Route 
          path="/certificates" 
          element={
            <ProtectedRoute>
              <CertificatesPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/courses" 
          element={
            <ProtectedRoute>
              <AdminCoursesPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/students" 
          element={
            <ProtectedRoute>
              <AdminStudentsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/payments" 
          element={
            <ProtectedRoute>
              <AdminPaymentsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/enrollments" 
          element={
            <ProtectedRoute>
              <AdminEnrollmentsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/quiz-builder/:moduleId" 
          element={
            <ProtectedRoute>
              <AdminQuizBuilderPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/applications" 
          element={
            <ProtectedRoute>
              <AdminApplicationsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/applications/:id" 
          element={
            <ProtectedRoute>
              <AdminApplicationDetailPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
