'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@123';
const STAFF_USERNAME = 'staff';
const STAFF_PASSWORD = 'Staff@123';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const role = localStorage.getItem('chakra_role');
    if (role) {
      if (role === 'staff') {
        router.push('/bikes');
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('chakra_auth', 'true');
        localStorage.setItem('chakra_role', 'admin');
        router.push('/');
      } else if (username.trim() === STAFF_USERNAME && password === STAFF_PASSWORD) {
        localStorage.setItem('chakra_auth', 'true');
        localStorage.setItem('chakra_role', 'staff');
        router.push('/bikes');
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-black transition-colors duration-500 relative overflow-hidden">
      {/* Background Kinetic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      <div className="relative w-full max-w-md fade-up">
        <div className="glass-panel rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden">
          {/* Internal Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="text-center mb-12 relative z-10">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-accent blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="bg-brand-accent p-5 rounded-3xl shadow-neon relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter leading-none uppercase">CHAKRA</h1>
            <p className="text-brand-accent font-display text-[10px] font-bold tracking-[0.5em] mt-3 opacity-80 uppercase">Service Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-5 py-4 rounded-2xl text-[10px] font-display font-bold tracking-widest flex items-center gap-3 fade-up uppercase">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] ml-2 uppercase">
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl focus:border-brand-accent/50 focus:ring-brand-accent/10 focus:ring-4 outline-none transition-all text-white font-mono placeholder:text-slate-700"
                  placeholder="ENTER USERNAME"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] ml-2 uppercase">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl focus:border-brand-accent/50 focus:ring-brand-accent/10 focus:ring-4 outline-none transition-all text-white font-mono placeholder:text-slate-700"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-accent cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-accent text-white py-5 rounded-2xl font-display font-bold tracking-widest shadow-neon hover:shadow-neon-strong kinetic-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <span>LOGIN</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center relative z-10">
            <p className="text-[10px] font-display font-bold text-slate-600 uppercase tracking-[0.3em]">
              Authorized Personnel Only
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-10">
          <span className="text-[10px] font-display font-bold text-slate-700 tracking-widest">© {new Date().getFullYear()}</span>
          <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
          <span className="text-[10px] font-display font-bold text-slate-700 tracking-widest">Management System</span>
        </div>
      </div>
    </div>
  );
}
