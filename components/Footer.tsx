'use client';

import { isSupabaseConfigured } from '@/lib/supabase';

export default function Footer() {
  const phone = '+918355882633';
  const email = 'test@chakra.com';
  const address = 'Street test, A12 Vashi';
  const whatsapp = '9183558822633';
  const useSupabase = isSupabaseConfigured();

  return (
    <footer className="bg-primary dark:bg-slate-950 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cta mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <a href={`tel:${phone}`} className="text-sm hover:text-cta transition-colors">
                +91 8355882633
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cta mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <a href={`mailto:${email}`} className="text-sm hover:text-cta transition-colors">
                test@chakra.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cta mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-xs text-slate-400">Address</p>
              <p className="text-sm">Street test, A12 Vashi</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cta mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <p className="text-xs text-slate-400">WhatsApp</p>
              <a 
                href={`https://wa.me/${whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:text-cta transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-6 pt-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Chakra. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${useSupabase ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="text-xs text-slate-400">
              {useSupabase ? 'Supabase Connected' : 'Local Storage'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}