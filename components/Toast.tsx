'use client';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
        isSuccess
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
          isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isSuccess ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div>
          <span className={`text-xs font-semibold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {isSuccess ? 'Success' : 'Error'}
          </span>
          <p className="text-sm text-slate-300">{message}</p>
        </div>
      </div>
    </div>
  );
}
