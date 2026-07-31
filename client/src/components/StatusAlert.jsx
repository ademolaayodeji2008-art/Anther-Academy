import { CheckCircle, AlertCircle } from 'lucide-react';

export default function StatusAlert({ type = 'success', message, onClose }) {
  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className={`mb-6 p-4 border rounded-lg flex items-start gap-3 ${
      isSuccess 
        ? 'bg-green-50 border-green-200' 
        : isError
        ? 'bg-red-50 border-red-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      {isSuccess && (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      )}
      {isError && (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <p className={`font-medium ${
        isSuccess 
          ? 'text-green-700' 
          : isError
          ? 'text-red-700'
          : 'text-blue-700'
      }`}>
        {message}
      </p>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-auto text-slate-500 hover:text-slate-700 flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}
