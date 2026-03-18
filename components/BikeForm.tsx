'use client';

import { useState } from 'react';
import { Bike } from '@/lib/types';
import Modal from './Modal';

interface BikeFormProps {
  bike?: Bike | null;
  onSave: (bike: Partial<Bike>) => void;
  onClose: () => void;
}

export default function BikeForm({ bike, onSave, onClose }: BikeFormProps) {
  const [formData, setFormData] = useState({
    bike_number: bike?.bike_number || '',
    bike_name: bike?.bike_name || '',
    customer_name: bike?.customer_name || '',
    mobile: bike?.mobile || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bike Name *
          </label>
          <input
            type="text"
            name="bike_name"
            value={formData.bike_name}
            onChange={handleChange}
            required
            placeholder="e.g., Honda Activa"
            className="w-full p-3 border border-slate-200 rounded-lg"
          />
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
