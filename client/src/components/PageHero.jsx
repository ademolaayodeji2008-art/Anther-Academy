import FadeIn from './FadeIn';

export default function PageHero({ image, eyebrow, title, subtitle, children, size = 'sm' }) {
  const padding = size === 'lg' ? 'py-24 md:py-32' : 'py-20';

  return (
    <section
      className={`relative bg-navy-900 text-white ${padding} bg-cover bg-center`}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/85 to-navy-900/60" />
      <div className="relative max-w-7xl mx-auto px-6">
        <FadeIn>
          {eyebrow && <p className="eyebrow text-gold-300 mb-5">{eyebrow}</p>}
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 max-w-2xl">{title}</h1>
          {subtitle && <p className="text-lg text-navy-200 max-w-xl">{subtitle}</p>}
          {children}
        </FadeIn>
      </div>
    </section>
  );
}
