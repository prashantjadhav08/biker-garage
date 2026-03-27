'use client';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
  const isSuccess = type === 'success';
  
  return (
    <div className="fixed bottom-8 right-8 z-[100] fade-up">
      <div className={`
        flex items-center gap-6 px-8 py-5 rounded-[2rem] shadow-2xl border backdrop-blur-2xl transition-all duration-500
        ${isSuccess 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' 
          : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/5'
        }
      `}>
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden
          ${isSuccess ? 'bg-emerald-500/20' : 'bg-rose-500/20'}
        `}>
          <div className={`absolute inset-0 blur-lg opacity-40 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          {isSuccess ? (
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-display font-bold tracking-[0.3em] uppercase opacity-60 mb-1">
            {isSuccess ? 'Success' : 'Error'}
          </span>
          <span className="font-display font-bold text-[11px] tracking-widest uppercase">{message}</span>
        </div>
      </div>
    </div>
  );
}
