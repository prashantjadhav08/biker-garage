'use client';

import { isSupabaseConfigured } from '@/lib/supabase';

export default function Footer() {
  const phone = '+918355882633';
  const email = 'test@chakra.com';
  const address = 'Street test, A12 Vashi';
  const whatsapp = '9183558822633';
  const useSupabase = isSupabaseConfigured();

  return (
    <footer className="bg-primary dark:bg-slate-950 text-white py-12 mt-auto border-t border-white/5 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-cta p-1 rounded-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <span className="font-mono font-bold text-lg tracking-tighter">CHAKRA</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Next-generation bike service management for modern garages. Efficiency in every turn.
            </p>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-cta/20 transition-colors">
              <svg className="w-5 h-5 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contact Support</p>
              <a href={`tel:${phone}`} className="text-sm font-semibold hover:text-cta transition-colors block">
                +91 8355882633
              </a>
              <a href={`mailto:${email}`} className="text-xs text-slate-400 hover:text-cta transition-colors block mt-1">
                {email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-cta/20 transition-colors">
              <svg className="w-5 h-5 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm font-semibold leading-snug">{address}</p>
              <p className="text-xs text-slate-400 mt-1">Open Mon-Sat: 9AM-8PM</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">WhatsApp</p>
              <a 
                href={`https://wa.me/${whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:text-emerald-400 transition-colors block"
              >
                Instant Connect
              </a>
              <p className="text-xs text-slate-400 mt-1">Get status updates</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} CHAKRA SYSTEMS
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${useSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {useSupabase ? 'Database Sync Active' : 'Local Persistence Mode'}
              </span>
            </div>
          </div>
          <div className="flex gap-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
