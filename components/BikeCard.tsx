'use client';

import { Bike } from '@/lib/types';

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (id: string) => void;
}

export default function BikeCard({ bike, onEdit, onDelete }: BikeCardProps) {
  return (
    <div className="card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 relative overflow-hidden group">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cta/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="bg-cta/10 dark:bg-cta/20 px-3 py-1.5 rounded-lg ring-1 ring-cta/20">
          <span className="font-mono font-bold text-cta dark:text-red-400 tracking-wider text-sm">{bike.bike_number}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(bike)}
            className="p-2 text-slate-400 hover:text-cta hover:bg-cta/10 rounded-xl cursor-pointer transition-all"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bike.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-all"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="font-bold text-primary dark:text-white text-xl mb-4 group-hover:text-cta transition-colors">
          {bike.bike_name}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-medium">{bike.customer_name}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="font-medium">+91 {bike.mobile}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(bike.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-[10px] font-bold text-cta/40 dark:text-cta/20 uppercase tracking-[0.2em]">
            Chakra Verified
          </div>
        </div>
      </div>
    </div>
  );
}
