import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import FadeIn from '../components/FadeIn';
import {
  Briefcase,
  BarChart3,
  Handshake,
  Target,
  Star,
  Users
} from 'lucide-react';

export default function AboutPage() {
  const facilitators = [
    {
      name: 'Kunle Adeyemi',
      role: 'Lead Facilitator',
      qualification: 'ACCA, Senior Accountant (Big 4)',
      bio: '15+ years in public practice. Specializes in financial reporting, audit, and training.',
      icon: Briefcase,
    },
    {
      name: 'Zainab Hassan',
      role: 'Senior Facilitator',
      qualification: 'ACA, Management Accountant',
      bio: '12 years in corporate finance and cost accounting. Passionate about practical skills transfer.',
      icon: Briefcase,
    },
    {
      name: 'Seun Okafor',
      role: 'Tax Specialist',
      qualification: 'ACCA, Tax Consultant',
      bio: '10 years in tax advisory. Brings real case studies to every lesson.',
      icon: Briefcase,
    },
    {
      name: 'Ama Mensah',
      role: 'Audit Specialist',
      qualification: 'CIMA, Head of Audit',
      bio: '8+ years in audit and assurance. Focuses on practical audit procedures.',
      icon: BarChart3,
    },
  ];

  const values = [
    {
      title: 'Practice-First Philosophy',
      description: 'Theory matters, but practice transforms. Every module is grounded in what accountants actually do.',
      icon: Target,
    },
    {
      title: 'Excellence Through Experience',
      description: 'Our facilitators are not academics—they\'re practitioners who bring live cases, real challenges, and proven solutions.',
      icon: Star,
    },
    {
      title: 'Inclusive Professional Development',
      description: 'Whether you\'re a graduate, practicing accountant, or chartered professional, we meet you where you are.',
      icon: Handshake,
    },
    {
      title: 'Continuous Improvement',
      description: 'We stay current with standards, regulations, and industry trends so our courses always reflect reality.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <PageHero
        image="/images/hero-about.jpg"
        eyebrow="About Us"
        title="Anther Academy"
        subtitle="Practical accounting training by professionals, for professionals"
      />

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <p className="eyebrow mb-4">Our Mission</p>
              <h2 className="text-4xl font-display font-semibold text-navy-900 mb-6">Bridging theory and practice</h2>
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                We believe the best learning happens when it reflects the real challenges accountants face every day.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Anther Academy exists to equip accountants—at every career stage—with practical, hands-on skills that make them more effective, confident, and valued in their roles. Whether you're a fresh graduate navigating your first year, a practicing accountant sharpening techniques, or a chartered professional deepening expertise, we're here to support your growth.
              </p>
            </FadeIn>
            <FadeIn delay={0.15} className="space-y-8">
              <div className="border-l-2 border-gold-300 pl-8 py-2">
                <p className="font-display text-2xl text-navy-900 leading-snug mb-4">
                  "Theory matters, but practice transforms."
                </p>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Anther Academy Philosophy</p>
              </div>
              <div className="aspect-[4/3] rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src="/images/hero-about.jpg"
                  alt="Anther Academy students in a training session"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">Core Values</p>
            <h2 className="text-4xl font-display font-semibold text-navy-900 mb-4">What drives everything we do</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-slate-200">
            {values.map((value, idx) => {
              const IconComponent = value.icon;
              return (
                <FadeIn key={idx} delay={idx * 0.08}>
                  <div className="p-8 border-b border-r border-slate-200 bg-white h-full">
                    <IconComponent className="w-8 h-8 text-navy-600 mb-4" strokeWidth={1.5} />
                    <h3 className="text-xl font-display font-semibold text-navy-900 mb-3">{value.title}</h3>
                    <p className="text-slate-700 leading-relaxed">{value.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Anther Academy */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">What Makes Us Different</p>
            <h2 className="text-4xl font-display font-semibold text-navy-900 mb-4">Why Anther Academy?</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <FadeIn delay={0}>
              <div className="py-8 border-t border-slate-200">
                <Briefcase className="w-7 h-7 text-navy-600 mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl font-display font-semibold text-navy-900 mb-4">
                  Curriculum Built on Practice
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Every course, every module, every lesson is designed by people who do this work. You won't hear "in theory, you should..." — instead, you'll hear "here's how we actually handle this scenario."
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <div className="py-8 border-t border-slate-200">
                <Star className="w-7 h-7 text-navy-600 mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl font-display font-semibold text-navy-900 mb-4">
                  Facilitators, Not Lecturers
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Our instructors bring decades of combined experience. They teach because they believe in passing on what they've learned. Your success is their success.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.16}>
              <div className="py-8 border-t border-slate-200">
                <Target className="w-7 h-7 text-navy-600 mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl font-display font-semibold text-navy-900 mb-4">
                  Tailored for Accountants
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Whether you're new to practice, building expertise, or chartered—we have paths designed for your level. No "one-size-fits-all" generic courses.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="py-8 border-t border-slate-200">
                <Users className="w-7 h-7 text-navy-600 mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl font-display font-semibold text-navy-900 mb-4">
                  Industry Standards
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  We stay current with IFRS, IPSAS, local regulations, and best practices. Your learning reflects how professionals work today, not yesterday.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Facilitators Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">Our Team</p>
            <h2 className="text-4xl font-display font-semibold text-navy-900 mb-4">Meet the facilitators</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Practicing professionals dedicated to your growth.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {facilitators.map((facilitator, idx) => {
              const initials = facilitator.name.split(' ').map(n => n[0]).join('');
              return (
                <FadeIn key={idx} delay={idx * 0.08}>
                  <div className="flex items-start gap-5 py-8 border-t border-slate-200">
                    <div className="w-14 h-14 rounded-full border border-navy-200 bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <span className="font-display font-semibold text-navy-700">{initials}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-display font-semibold text-navy-900">{facilitator.name}</h3>
                      <p className="text-gold-600 font-medium text-sm mb-1">{facilitator.role}</p>
                      <p className="text-slate-600 text-sm font-medium mb-3">{facilitator.qualification}</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{facilitator.bio}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Credibility Stats */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 text-center">
            <FadeIn delay={0} className="px-4">
              <p className="text-5xl font-display font-semibold text-gold-300 mb-2">2,500+</p>
              <p className="text-navy-300 text-sm uppercase tracking-wide">Students Trained</p>
            </FadeIn>
            <FadeIn delay={0.1} className="px-4">
              <p className="text-5xl font-display font-semibold text-gold-300 mb-2">94%</p>
              <p className="text-navy-300 text-sm uppercase tracking-wide">Completion Rate</p>
            </FadeIn>
            <FadeIn delay={0.2} className="px-4">
              <p className="text-5xl font-display font-semibold text-gold-300 mb-2">15+</p>
              <p className="text-navy-300 text-sm uppercase tracking-wide">Certified Facilitators</p>
            </FadeIn>
            <FadeIn delay={0.3} className="px-4">
              <p className="text-5xl font-display font-semibold text-gold-300 mb-2">4.8/5</p>
              <p className="text-navy-300 text-sm uppercase tracking-wide">Average Rating</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="max-w-3xl mx-auto text-center">
            <p className="eyebrow mb-6 justify-center flex">Our Commitment</p>
            <p className="font-display text-2xl md:text-3xl text-navy-900 leading-snug mb-8">
              We are committed to delivering training that transforms how you approach accounting—whether you're struggling with fundamentals, looking to specialize, or aiming to lead.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              This isn't a one-time course. It's part of your professional journey. After you complete a course, you'll have lifetime access to materials, updates, and a community of practicing accountants facing similar challenges.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Your growth is our measure of success.
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
