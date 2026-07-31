import { useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function CourseThumbnail({ src, alt, className = "w-full h-full object-cover" }) {
  const [isError, setIsError] = useState(!src);

  if (isError || !src) {
    return (
      <div className={`bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gold-300 mx-auto mb-2" />
          <p className="text-white text-sm font-medium px-4 line-clamp-2">{alt || 'Course'}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIsError(true)}
    />
  );
}
