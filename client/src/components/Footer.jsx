import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="Anther Academy" className="w-9 h-9" />
              <span className="text-lg font-display font-semibold">Anther Academy</span>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed">
              Practical accounting training for professionals at every level—from fresh graduates to chartered accountants.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="eyebrow text-gold-300 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-navy-100 hover:text-gold-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-navy-100 hover:text-gold-300 transition">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-navy-100 hover:text-gold-300 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-navy-100 hover:text-gold-300 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Paths */}
          <div>
            <h4 className="eyebrow text-gold-300 mb-4">Learning Paths</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/courses?level=new_to_practice" className="text-navy-100 hover:text-gold-300 transition">
                  New to Practice
                </a>
              </li>
              <li>
                <a href="/courses?level=practicing_accountant" className="text-navy-100 hover:text-gold-300 transition">
                  Practicing Accountant
                </a>
              </li>
              <li>
                <a href="/courses?level=chartered_advanced" className="text-navy-100 hover:text-gold-300 transition">
                  Chartered/Advanced
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="eyebrow text-gold-300 mb-4">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-navy-100">Email</p>
                <a href="mailto:hello@antheracademy.com" className="text-gold-300 hover:text-gold-400 transition">
                  hello@antheracademy.com
                </a>
              </div>
              <div>
                <p className="text-navy-100">Phone</p>
                <a href="tel:+234123456789" className="text-gold-300 hover:text-gold-400 transition">
                  +234 (0) 123 456 789
                </a>
              </div>
              <div>
                <p className="text-navy-100">Address</p>
                <p className="text-navy-200">Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-navy-800"></div>

        {/* Bottom Footer */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-navy-100">
            &copy; {currentYear} Anther Academy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-navy-100 hover:text-gold-300 transition">
              Privacy Policy
            </a>
            <a href="#" className="text-navy-100 hover:text-gold-300 transition">
              Terms of Service
            </a>
            <a href="#" className="text-navy-100 hover:text-gold-300 transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
