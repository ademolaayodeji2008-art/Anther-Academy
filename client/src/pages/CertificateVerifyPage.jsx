import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AlertCircle, CheckCircle, Award } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CertificateVerifyPage() {
  const { code: initialCode } = useParams();

  const [code, setCode] = useState(initialCode || '');
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setCertificate(null);

      const res = await axios.get(
        `${API_BASE_URL}/api/certificates/verify/${code.toUpperCase()}`
      );

      setCertificate(res.data.certificate);
      setSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Certificate not found or invalid code'
      );
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // If code passed in URL, auto-verify
  if (initialCode && !searched) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Verifying certificate...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Verify Certificate
          </h1>
          <p className="text-slate-600">
            Enter the certificate verification code to confirm its authenticity
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-8 mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.g., ANTH-XXXX-XXXX-XXXX"
                className="input-field w-full"
              />
              <p className="text-xs text-slate-500 mt-2">
                Format: ANTH-XXXX-XXXX-XXXX (found on your certificate)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && searched && (
          <div className="card border-2 border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Certificate Not Found
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">
              Please check the code and try again. If you believe this is an error,
              contact Anther Academy support.
            </p>
          </div>
        )}

        {/* Success Message */}
        {certificate && searched && (
          <div className="card border-2 border-green-200 bg-green-50 p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Certificate Verified
              </h2>
              <p className="text-green-700">This is a genuine certificate from Anther Academy</p>
            </div>

            {/* Certificate Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Student Name
                    </p>
                    <p className="text-xl font-bold text-navy-900">
                      {certificate.student_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Issue Date
                    </p>
                    <p className="text-xl font-bold text-navy-900">
                      {certificate.issue_date}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Course Title
                    </p>
                    <p className="text-xl font-bold text-gold-600">
                      {certificate.course_title}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Verification Code
                    </p>
                    <p className="font-mono text-sm text-slate-900 break-all">
                      {certificate.verification_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <p className="font-medium text-blue-900 mb-1">
                      Why can you trust this certificate?
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Issued by Anther Academy</li>
                      <li>✓ Unique verification code prevents forgery</li>
                      <li>✓ Student completed all course requirements</li>
                      <li>✓ Digital trail for authenticity verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center text-xs text-slate-600 pt-4 border-t">
                <p>
                  This verification was performed on{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* New Search Button */}
            <button
              onClick={() => {
                setCode('');
                setCertificate(null);
                setError('');
                setSearched(false);
              }}
              className="btn-outline w-full mt-8 py-3"
            >
              Verify Another Certificate
            </button>
          </div>
        )}

        {/* Info Section */}
        {!searched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-bold text-navy-900 mb-2">
                Where to find your code
              </h3>
              <p className="text-sm text-slate-600">
                Your verification code is printed on your certificate and included
                in the email you received upon completion.
              </p>
            </div>

            <div className="card p-6">
              <Award className="w-12 h-12 text-gold-400 mx-auto mb-3" />
              <h3 className="font-bold text-navy-900 mb-2">
                What this verifies
              </h3>
              <p className="text-sm text-slate-600">
                This confirms that the certificate holder completed all required
                course modules and passed the final assessment.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-bold text-navy-900 mb-2">
                Security
              </h3>
              <p className="text-sm text-slate-600">
                Each certificate has a unique code. This makes it nearly impossible
                to forge or duplicate.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-3xl mb-3">❓</div>
              <h3 className="font-bold text-navy-900 mb-2">
                Need help?
              </h3>
              <p className="text-sm text-slate-600">
                Contact Anther Academy support if you have questions about your
                certificate.
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
