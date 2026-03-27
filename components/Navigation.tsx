'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname();
  const role = getUserRole();
  const { theme, toggleTheme } = useTheme();

  const adminNavItems = [
    { href: '/', label: 'DASHBOARD', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/bikes', label: 'BIKES', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { href: '/billing', label: 'BILLING', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    { href: '/history', label: 'HISTORY', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const staffNavItems = [
    { href: '/bikes', label: 'BIKES', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { href: '/billing', label: 'BILLING', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  ];

  const navItems = role === 'staff' ? staffNavItems : adminNavItems;

  return (
    <nav className="sticky top-0 z-50 transition-all duration-500">
      <div className="absolute inset-0 bg-white/80 dark:bg-brand-black/80 backdrop-blur-2xl shadow-soft dark:shadow-2xl border-b border-slate-200 dark:border-white/5"></div>
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-accent/20 blur-xl rounded-full"></div>
              <svg className="w-10 h-10 text-brand-accent relative z-10 orange-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">CHAKRA</span>
              <span className="text-[10px] font-display font-bold text-brand-accent tracking-[0.3em] mt-1 uppercase">Management</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-full p-1 border border-slate-200 dark:border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-display text-[11px] font-bold tracking-widest transition-all duration-300 ${
                  pathname === item.href
                    ? 'text-white bg-brand-accent shadow-neon'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 text-slate-500 dark:text-slate-400 hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-brand-accent/20"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-rose-500/20"
            >
              <svg className="w-5 h-5 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline font-display text-[10px] font-bold tracking-[0.2em]">LOGOUT</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
