'use client';

import { useState, useEffect, useRef } from 'react';
import { Bike } from '@/lib/types';
import Modal from './Modal';

interface BikeFormProps {
  bike?: Bike | null;
  onSave: (bike: Partial<Bike>) => void;
  onClose: () => void;
}

const INDIAN_BIKES = [
  'Honda Activa 6G', 'Honda Shine', 'Honda Hornet 2.0', 'Honda CBR650R',
  'Hero Splendor Plus', 'Hero Glamour', 'Hero HF Deluxe', 'Hero Passion Pro',
  'Hero Maestro Edge', 'Hero Destini 125', 'Bajaj Pulsar 150', 'Bajaj Pulsar NS200',
  'Bajaj Pulsar RS200', 'Bajaj Platina', 'Bajaj Avenger Street 160', 'Bajaj Dominar 400',
  'TVS Apache RTR 160', 'TVS Apache RTR 200 4V', 'TVS Jupiter', 'TVS Ntorq 125',
  'TVS Raider 125', 'Royal Enfield Classic 350', 'Royal Enfield Bullet 350',
  'Royal Enfield Himalayan 450', 'Royal Enfield Continental GT 650', 'Royal Enfield Interceptor 650',
  'Suzuki Access 125', 'Suzuki Burgman Street', 'Suzuki Gixxer SF', 'Suzuki Hayabusa',
  'Yamaha MT-15', 'Yamaha R15 V4', 'Yamaha FZS-Fi', 'Yamaha Fascino 125', 'Yamaha Ray-ZR',
  'KTM Duke 200', 'KTM Duke 250', 'KTM Duke 390', 'KTM RC 200', 'KTM RC 390',
  'Kawasaki Ninja 300', 'Kawasaki Ninja ZX-10R', 'Kawasaki Z650', 'BMW G310 R',
  'BMW G310 GS', 'BMW S1000 RR', 'Benelli TRK 502', 'Benelli Leoncino 500',
  'Jawa 42', 'Jawa Perak', 'Jawa 350', 'Yezdi Roadster', 'Yezdi Scrambler',
  'Yezdi Adventure', 'Ather 450X', 'Ather 450S', 'Ola S1 Pro', 'Ola S1 Air',
  'TVS iQube', 'Bajaj Chetak', 'Hero Vida V1', 'Amo Jaunty', 'Cyclone R1',
  'LML Freedom', 'Kinetic Green Zor',
];

export default function BikeForm({ bike, onSave, onClose }: BikeFormProps) {
  const [formData, setFormData] = useState({
    bike_number: bike?.bike_number || '',
    bike_name: bike?.bike_name || '',
    customer_name: bike?.customer_name || '',
    mobile: bike?.mobile || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'bike_name' && value.length > 0) {
      const filtered = INDIAN_BIKES.filter((bike) =>
        bike.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (bikeName: string) => {
    setFormData((prev) => ({ ...prev, bike_name: bikeName }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={bike ? 'Edit Bike' : 'Register New Bike'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-brand-black p-2">
        <div className="group">
          <label className="block text-[9px] font-display font-bold text-slate-500 tracking-[0.3em] mb-3 ml-2 group-focus-within:text-brand-accent transition-colors uppercase">
            Bike Number
          </label>
          <input
            type="text"
            name="bike_number"
            value={formData.bike_number}
            onChange={handleChange}
            required
            placeholder="e.g. MH12AB1234"
            className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-mono text-sm tracking-[0.2em] focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all uppercase placeholder:text-slate-400 dark:placeholder:text-slate-800"
          />
        </div>

        <div className="relative group">
          <label className="block text-[9px] font-display font-bold text-slate-500 tracking-[0.3em] mb-3 ml-2 group-focus-within:text-brand-accent transition-colors uppercase">
            Bike Name / Model
          </label>
          <input
            type="text"
            name="bike_name"
            value={formData.bike_name}
            onChange={handleChange}
            onFocus={() => {
              if (formData.bike_name.length > 0 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            required
            placeholder="Search or enter model..."
            className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-display text-xs tracking-widest focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-800"
            autoComplete="off"
          />
          
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-3 bg-white dark:bg-brand-black border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-2xl max-h-64 overflow-y-auto fade-up backdrop-blur-xl"
            >
              <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <span className="text-[8px] font-display font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Popular Models</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-6 py-4 hover:bg-brand-accent/10 text-slate-700 dark:text-slate-300 hover:text-brand-accent cursor-pointer transition-all flex items-center gap-4 font-display text-[10px] tracking-tight border-b border-slate-100 dark:border-white/5 last:border-0"
                >
                  <div className="w-1 h-1 bg-brand-accent rounded-full"></div>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="group">
          <label className="block text-[9px] font-display font-bold text-slate-500 tracking-[0.3em] mb-3 ml-2 group-focus-within:text-brand-accent transition-colors uppercase">
            Customer Name
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            placeholder="Enter customer name..."
            className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-display text-xs tracking-widest focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-800 uppercase"
          />
        </div>

        <div className="group">
          <label className="block text-[9px] font-display font-bold text-slate-500 tracking-[0.3em] mb-3 ml-2 group-focus-within:text-brand-accent transition-colors uppercase">
            Mobile Number
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-mono text-sm">+91</span>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="0000000000"
              className="w-full p-5 pl-16 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-mono text-sm tracking-[0.2em] focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-800"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-100 dark:border-white/5 rounded-2xl font-display font-bold text-[10px] tracking-[0.2em] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-5 bg-brand-accent text-white rounded-2xl font-display font-bold text-[10px] tracking-[0.2em] shadow-neon kinetic-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Bike'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
