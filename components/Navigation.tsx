'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/bikes', label: 'Bikes', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { href: '/billing', label: 'Billing', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    { href: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="font-mono font-bold text-xl tracking-wider">CHAKRA</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-cta border-b-2 border-cta'
                    : 'hover:text-cta'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-secondary rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
