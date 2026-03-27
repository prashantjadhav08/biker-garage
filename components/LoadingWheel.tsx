'use client';

export default function LoadingWheel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
        
        {/* Spinning Progress Ring */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-transparent border-t-cta animate-spin"></div>
        
        {/* Inner Logo Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-cta animate-pulse" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <h2 className="text-xl font-mono font-bold text-primary dark:text-white tracking-widest uppercase animate-pulse">
          Chakra
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 font-medium tracking-[0.2em] uppercase">
          Initializing Engine...
        </p>
      </div>
    </div>
  );
}
