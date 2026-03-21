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
  'Honda Activa 6G',
  'Honda Shine',
  'Honda Hornet 2.0',
  'Honda CBR650R',
  'Hero Splendor Plus',
  'Hero Glamour',
  'Hero HF Deluxe',
  'Hero Passion Pro',
  'Hero Maestro Edge',
  'Hero Destini 125',
  'Bajaj Pulsar 150',
  'Bajaj Pulsar NS200',
  'Bajaj Pulsar RS200',
  'Bajaj Platina',
  'Bajaj Avenger Street 160',
  'Bajaj Dominar 400',
  'TVS Apache RTR 160',
  'TVS Apache RTR 200 4V',
  'TVS Jupiter',
  'TVS Ntorq 125',
  'TVS Raider 125',
  'Royal Enfield Classic 350',
  'Royal Enfield Bullet 350',
  'Royal Enfield Himalayan 450',
  'Royal Enfield Continental GT 650',
  'Royal Enfield Interceptor 650',
  'Suzuki Access 125',
  'Suzuki Burgman Street',
  'Suzuki Gixxer SF',
  'Suzuki Hayabusa',
  'Yamaha MT-15',
  'Yamaha R15 V4',
  'Yamaha FZS-Fi',
  'Yamaha Fascino 125',
  'Yamaha Ray-ZR',
  'KTM Duke 200',
  'KTM Duke 250',
  'KTM Duke 390',
  'KTM RC 200',
  'KTM RC 390',
  'Kawasaki Ninja 300',
  'Kawasaki Ninja ZX-10R',
  'Kawasaki Z650',
  'BMW G310 R',
  'BMW G310 GS',
  'BMW S1000 RR',
  'Benelli TRK 502',
  'Benelli Leoncino 500',
  'Jawa 42',
  'Jawa Perak',
  'Jawa 350',
  'Yezdi Roadster',
  'Yezdi Scrambler',
  'Yezdi Adventure',
  'Ather 450X',
  'Ather 450S',
  'Ola S1 Pro',
  'Ola S1 Air',
  'TVS iQube',
  'Bajaj Chetak',
  'Hero Vida V1',
  'Amo Jaunty',
  'Cyclone R1',
  'LML Freedom',
  'Kinetic Green Zor',
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bike Number *
          </label>
          <input
            type="text"
            name="bike_number"
            value={formData.bike_number}
            onChange={handleChange}
            required
            placeholder="e.g., MH12AB1234"
            className="w-full p-3 border border-slate-200 rounded-lg uppercase"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bike Name *
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
            className="w-full p-3 border border-slate-200 rounded-lg"
            autoComplete="off"
          />
          
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              <div className="p-2 bg-slate-100 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Popular Indian Bikes</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-cta/10 text-slate-700 cursor-pointer transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            placeholder="e.g., John Doe"
            className="w-full p-3 border border-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            placeholder="e.g., 9876543210"
            className="w-full p-3 border border-slate-200 rounded-lg"
            maxLength={10}
            pattern="[0-9]{10}"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-cta text-white rounded-lg font-semibold btn-hover cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Bike'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
