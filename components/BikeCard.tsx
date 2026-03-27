'use client';

import { Bike } from '@/lib/types';

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (id: string) => void;
}

export default function BikeCard({ bike, onEdit, onDelete }: BikeCardProps) {
  return (
    <div className="glass-card p-8 group relative overflow-hidden kinetic-hover border border-white/5">
      {/* Dynamic Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-accent/10 transition-colors duration-500"></div>
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="bg-brand-accent px-4 py-2 rounded-xl shadow-neon transition-transform group-hover:scale-110 duration-500">
          <span className="font-mono font-bold text-white tracking-widest text-sm uppercase">{bike.bike_number}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(bike)}
            className="p-2.5 text-slate-500 hover:text-brand-accent hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 cursor-pointer"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bike.id)}
            className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 cursor-pointer"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="font-display font-bold text-white text-2xl mb-6 tracking-tight group-hover:text-brand-accent transition-colors duration-500 uppercase">
          {bike.bike_name}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 group/item">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/item:border-brand-accent/20 transition-all">
              <svg className="w-4 h-4 text-slate-500 group-hover/item:text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-display font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Customer</p>
              <p className="font-display font-bold text-slate-300 text-[11px] tracking-tight uppercase">{bike.customer_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 group/item">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/item:border-brand-accent/20 transition-all">
              <svg className="w-4 h-4 text-slate-500 group-hover/item:text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-display font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Mobile</p>
              <p className="font-mono font-bold text-slate-300 text-[11px] tracking-tight">+91 {bike.mobile}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-[9px] font-display font-bold tracking-[0.2em]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            ACTIVE
          </div>
          <span className="text-[9px] font-display font-bold text-slate-700 tracking-[0.3em] uppercase">Verified</span>
        </div>
      </div>
    </div>
  );
}
