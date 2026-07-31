import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StatusAlert from '../components/StatusAlert';
import { Award, Download, Search, Lock, Briefcase } from 'lucide-react';
import axios from 'axios';
import authService from '../lib/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const user = authService.getStoredUser();
  const token = authService.getToken();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        setError('');

        const res = await axios.get(
          `${API_BASE_URL}/api/certificates/user/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCertificates(res.data.certificates);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError(err.response?.data?.message || 'Failed to load certificates');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchCertificates();
    }
  }, [user, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Loading certificates...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            My Certificates
          </h1>
          <p className="text-slate-600">
            Download and share your earned certificates
          </p>
        </div>

        {error && (
          <StatusAlert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* No Certificates */}
        {certificates.length === 0 ? (
          <div className="card p-12 text-center">
            <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-900 mb-2">
              No certificates yet
            </p>
            <p className="text-slate-600 mb-6">
              Complete a course and pass the final quiz to earn a certificate.
            </p>
            <a href="/dashboard" className="btn-primary">
              Back to Dashboard
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                {/* Certificate Preview Card */}
                <div className="bg-gradient-to-br from-navy-50 to-blue-50 p-8 text-center min-h-64 flex flex-col justify-between">
                  <div>
                    <Award className="w-16 h-16 text-gold-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Certificate of Completion
                    </p>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                      {cert.courses?.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
                    <p>
                      Issued {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6 space-y-4">
                  {/* Verification Code */}
                  <div className="bg-slate-50 rounded p-3">
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Verification Code
                    </p>
                    <p className="font-mono text-sm text-slate-900 break-all">
                      {cert.verification_code}
                    </p>
                  </div>

                  {/* Issue Date */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Issue Date
                    </p>
                    <p className="text-sm text-slate-900">
                      {new Date(cert.issued_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <a
                      href={cert.certificate_url}
                      download
                      className="btn-primary w-full py-2 text-center text-sm flex items-center justify-center gap-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                    <a
                      href={`/verify/${cert.verification_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full py-2 text-center text-sm flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Verify Online
                    </a>
                  </div>

                  {/* Share Info */}
                  <div className="text-xs text-slate-500 text-center pt-2">
                    <p>Share the verification code to prove authenticity</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="card p-6">
              <Download className="w-8 h-8 text-gold-400 mb-3" />
              <h3 className="font-bold text-navy-900 mb-2">Download</h3>
              <p className="text-sm text-slate-600">
                Download your certificate as a PDF file. You can print it or save
                it for your records.
              </p>
            </div>

            <div className="card p-6">
              <Search className="w-8 h-8 text-gold-400 mb-3" />
              <h3 className="font-bold text-navy-900 mb-2">Share</h3>
              <p className="text-sm text-slate-600">
                Share your verification code with employers or clients to prove
                your credentials.
              </p>
            </div>

            <div className="card p-6">
              <Lock className="w-8 h-8 text-gold-400 mb-3" />
              <h3 className="font-bold text-navy-900 mb-2">Verify</h3>
              <p className="text-sm text-slate-600">
                Anyone can verify your certificate using the unique verification code
                on the public verification page.
              </p>
            </div>

            <div className="card p-6">
              <Briefcase className="w-8 h-8 text-gold-400 mb-3" />
              <h3 className="font-bold text-navy-900 mb-2">LinkedIn</h3>
              <p className="text-sm text-slate-600">
                Add your certificate to your LinkedIn profile to showcase your
                professional development.
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
