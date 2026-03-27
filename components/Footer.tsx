'use client';

import { isSupabaseConfigured } from '@/lib/supabase';

export default function Footer() {
  const phone = '+918355882633';
  const email = 'test@chakra.com';
  const address = 'Street test, A12 Vashi';
  const whatsapp = '9183558822633';
  const useSupabase = isSupabaseConfigured();

  return (
    <footer className="bg-brand-black text-slate-400 py-16 mt-auto border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-8 text-brand-accent orange-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
              <span className="font-display font-bold text-xl tracking-tighter text-white uppercase">CHAKRA</span>
            </div>
            <p className="text-[10px] font-display font-bold tracking-[0.2em] leading-relaxed uppercase opacity-60">
              Professional bike service management system. Streamlining operations with precision.
            </p>
          </div>

          {[
            { label: 'SUPPORT', value: phone, sub: email, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
            { label: 'ADDRESS', value: address, sub: 'Vashi, Navi Mumbai', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
            { label: 'STATUS', value: useSupabase ? 'CONNECTED' : 'LOCAL MODE', sub: 'v1.4.2-STABLE', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity uppercase">
                <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
                </svg>
                <span className="text-[10px] font-display font-bold tracking-[0.3em] uppercase">{item.label}</span>
              </div>
              <p className="text-[11px] font-display font-bold text-white tracking-widest uppercase">{item.value}</p>
              <p className="text-[9px] font-mono font-bold text-slate-600 mt-1 uppercase tracking-tighter">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-display font-bold tracking-[0.4em] opacity-40 uppercase">© {new Date().getFullYear()} CHAKRA SYSTEMS</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${useSupabase ? 'bg-emerald-500 shadow-neon' : 'bg-amber-500'}`}></div>
              <span className="text-[9px] font-display font-bold tracking-[0.2em] opacity-40 uppercase">System Active</span>
            </div>
          </div>
          <div className="flex gap-10">
            {['PRIVACY', 'TERMS', 'HELP'].map((link, i) => (
              <span key={i} className="text-[9px] font-display font-bold tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-brand-accent cursor-pointer transition-all uppercase">{link}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
