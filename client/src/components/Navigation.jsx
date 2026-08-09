import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../lib/authService';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const navLinkClass = "relative text-sm uppercase tracking-widest font-medium text-slate-700 hover:text-navy-900 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold-400 after:transition-all hover:after:w-full";

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
            <img src="/logo.png" alt="Anther Academy" className="w-10 h-10 object-contain" />
            <span className="text-lg font-display font-semibold text-navy-900 hidden sm:inline">Anther Academy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/courses" className={navLinkClass}>
              Courses
            </Link>
            <Link to="/about" className={navLinkClass}>
              About
            </Link>
            <Link to="/contact" className={navLinkClass}>
              Contact
            </Link>
          </div>

          {/* Right Side - Auth Links */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-slate-700 hover:text-navy-600 font-medium transition bg-gold-100 px-3 py-1 rounded"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className="text-slate-700 hover:text-navy-600 font-medium transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline px-4 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Enroll Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 focus:outline-none"
          >
            <div className="w-6 h-0.5 bg-navy-900"></div>
            <div className="w-6 h-0.5 bg-navy-900"></div>
            <div className="w-6 h-0.5 bg-navy-900"></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 space-y-3">
            <Link 
              to="/" 
              className="block text-slate-700 hover:text-navy-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/courses" 
              className="block text-slate-700 hover:text-navy-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link 
              to="/about" 
              className="block text-slate-700 hover:text-navy-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block text-slate-700 hover:text-navy-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="block text-gold-600 hover:text-gold-700 font-bold py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      → Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="block text-slate-700 hover:text-navy-600 font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn-outline w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline w-full text-center">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary w-full text-center">
                    Enroll Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
