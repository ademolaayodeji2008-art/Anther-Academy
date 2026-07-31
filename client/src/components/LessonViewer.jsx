import { useState, useEffect } from 'react';

/**
 * LessonViewer Component
 * Displays lesson content based on content_type:
 * - video: Embedded video player
 * - pdf: PDF viewer (embed or link)
 * - text: Rich text content
 */
export default function LessonViewer({ lesson }) {
  const [contentError, setContentError] = useState(false);

  if (!lesson) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">Select a lesson to begin</p>
      </div>
    );
  }

  const contentType = lesson.content_type || 'text';
  const contentUrl = lesson.content_url;

  return (
    <div className="card overflow-hidden">
      {/* Video Content */}
      {contentType === 'video' && (
        <div className="bg-black">
          <div className="aspect-video w-full">
            {contentUrl ? (
              <iframe
                width="100%"
                height="100%"
                src={
                  contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be')
                    ? // YouTube embed
                      `https://www.youtube.com/embed/${new URL(contentUrl).searchParams.get('v') || contentUrl.split('/').pop()}`
                    : // Direct video or other embeds
                      contentUrl
                }
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-2xl mb-2">🎬</p>
                  <p>Video content not available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Content */}
      {contentType === 'pdf' && (
        <div className="bg-gray-100 min-h-96 flex items-center justify-center">
          {contentUrl ? (
            <div className="text-center p-8">
              <p className="text-4xl mb-4">📄</p>
              <p className="text-slate-700 mb-4">PDF Document</p>
              <a
                href={contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Open PDF ↗
              </a>
              <p className="text-sm text-slate-500 mt-4">
                Opens in a new tab
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-600">PDF content not available</p>
            </div>
          )}
        </div>
      )}

      {/* Text Content */}
      {contentType === 'text' && (
        <div className="p-8">
          {contentUrl ? (
            <div className="prose max-w-none">
              {/* Render HTML content */}
              <div
                className="text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: contentUrl.startsWith('<')
                    ? contentUrl
                    : `<p>${contentUrl.split('\n').join('</p><p>')}</p>`,
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">No lesson content available</p>
            </div>
          )}
        </div>
      )}

      {/* Fallback for unknown content type */}
      {!['video', 'pdf', 'text'].includes(contentType) && (
        <div className="p-8 text-center">
          <p className="text-slate-600">Unsupported content type: {contentType}</p>
        </div>
      )}

      {/* Lesson Metadata */}
      <div className="border-t border-slate-200 p-6 bg-slate-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Content Type</p>
            <p className="text-sm font-medium text-navy-900 capitalize">{contentType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Duration</p>
            <p className="text-sm font-medium text-navy-900">~15 min</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Difficulty</p>
            <p className="text-sm font-medium text-navy-900">Intermediate</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Resources</p>
            <a
              href="#"
              className="text-sm font-medium text-navy-500 hover:text-navy-700"
            >
              Download Notes
            </a>
          </div>
        </div>
      </div>

      {/* Lesson Summary */}
      <div className="p-6 border-t border-slate-200">
        <h3 className="font-bold text-navy-900 mb-3">Lesson Summary</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>✓ Learn the fundamentals of {lesson.title.toLowerCase()}</li>
          <li>✓ Understand real-world applications</li>
          <li>✓ Practice with examples</li>
          <li>✓ Complete the practice questions</li>
        </ul>
      </div>
    </div>
  );
}
