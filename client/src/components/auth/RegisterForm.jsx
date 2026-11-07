import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Navigation from '../Navigation';
import Footer from '../Footer';

export default function RegisterForm() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-4">
            Apply Through Expression of Interest
          </h1>
          <p className="text-slate-600 mb-6">
            To join ANTHER Academy, please submit an Expression of Interest. Our admissions team will review your application and create your account if you're admitted.
          </p>
          <div className="space-y-4">
            <Link
              to="/expression-of-interest"
              className="btn-primary w-full block text-center"
            >
              Submit Expression of Interest
            </Link>
            <Link
              to="/login"
              className="text-sm text-navy-600 hover:underline block"
            >
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
