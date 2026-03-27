'use client';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
  const isSuccess = type === 'success';
  
  return (
    <div className={`fixed bottom-6 right-6 z-[100] toast-enter`}>
      <div className={`
        flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${isSuccess 
          ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
          : 'bg-rose-50/90 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }
      `}>
        <div className={`p-2 rounded-full ${isSuccess ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
          {isSuccess ? (
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <span className="font-semibold tracking-tight">{message}</span>
      </div>
    </div>
  );
}
