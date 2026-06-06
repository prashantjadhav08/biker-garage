'use client';

import { Bike } from '@/lib/types';

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (id: string) => void;
}

export default function BikeCard({ bike, onEdit, onDelete }: BikeCardProps) {
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-md">
          <span className="font-mono font-bold text-sm">{bike.bike_number}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(bike)}
            className="p-2 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bike.id)}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-slate-50 text-lg mb-4">{bike.bike_name}</h3>

      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-app-surface-hover flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm text-slate-400">{bike.customer_name}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-app-surface-hover flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-sm font-mono text-slate-400">+91 {bike.mobile}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          Active
        </div>
        <span className="text-xs text-slate-600">Verified</span>
      </div>
    </div>
  );
}
