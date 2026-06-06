'use client';

export default function Footer() {
  return (
    <footer className="bg-app-surface border-t border-app-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Chakra Systems</span>
        <span className="text-[10px] text-slate-600">Developed by Blackmorph Technologies</span>
      </div>
    </footer>
  );
}
