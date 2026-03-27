'use client';

export default function LoadingWheel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/5 blur-[100px] rounded-full"></div>
      
      <div className="relative group">
        {/* Kinetic Rings */}
        <div className="w-32 h-32 rounded-[2.5rem] border-[3px] border-white/5 group-hover:border-brand-accent/10 transition-colors duration-1000"></div>
        
        {/* Rapid Pulse Ring */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-[2.5rem] border-[3px] border-transparent border-t-brand-accent animate-spin" style={{ animationDuration: '0.8s' }}></div>
        
        {/* Inner Slow Ring */}
        <div className="absolute top-4 left-4 w-24 h-24 rounded-[2rem] border-2 border-transparent border-b-brand-accent/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        
        {/* Central Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-accent blur-xl opacity-20 animate-pulse"></div>
            <svg 
              className="w-10 h-10 text-brand-accent relative z-10 orange-glow" 
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
      </div>
      
      <div className="mt-12 flex flex-col items-center relative z-10">
        <h2 className="text-xl font-display font-bold text-white tracking-[0.4em] uppercase animate-pulse">
          CHAKRA
        </h2>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-slate-500 text-[10px] font-display font-bold tracking-[0.3em] uppercase">
            Loading System
          </p>
        </div>
      </div>
    </div>
  );
}
