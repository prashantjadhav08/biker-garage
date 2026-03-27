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
      title={bike ? 'EDIT BIKE' : 'ADD NEW BIKE'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-cta transition-colors">
            Bike Number <span className="text-cta">*</span>
          </label>
          <input
            type="text"
            name="bike_number"
            value={formData.bike_number}
            onChange={handleChange}
            required
            placeholder="e.g., MH12AB1234"
            className="w-full p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl uppercase font-mono tracking-wider focus:ring-4 focus:ring-cta/10 outline-none"
          />
        </div>

        <div className="relative group">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-cta transition-colors">
            Bike Name <span className="text-cta">*</span>
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
            placeholder="Search or type bike name"
            className="w-full p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-cta/10 outline-none"
            autoComplete="off"
          />
          
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-64 overflow-y-auto fade-in"
            >
              <div className="p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Popular Indian Bikes</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-cta/5 dark:hover:bg-cta/10 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-cta transition-colors">
            Customer Name <span className="text-cta">*</span>
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            placeholder="e.g., John Doe"
            className="w-full p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-cta/10 outline-none"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-cta transition-colors">
            Mobile Number <span className="text-cta">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="9876543210"
              className="w-full p-3.5 pl-12 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-cta/10 outline-none"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-cta text-white rounded-xl font-bold btn-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
