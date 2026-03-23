'use client';

export default function LoadingWheel() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <svg 
        className="w-16 h-16 animate-spin text-cta" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <circle cx="12" cy="12" r="6" opacity="0.5"/>
        <circle cx="12" cy="12" r="2"/>
        <line x1="12" y1="2" x2="12" y2="6" strokeLinecap="round"/>
        <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="6" y2="12" strokeLinecap="round"/>
        <line x1="18" y1="12" x2="22" y2="12" strokeLinecap="round"/>
      </svg>
    </div>
  );
}